import axios, {
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { handleRefresh } from "./refreshService";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getTokenExpiration,
} from "../../utils/tokenUtils";
import { supabaseRealtimeClient } from "../realtime/supabaseRealtimeClient";

export const AUTH_SESSION_EXPIRED_EVENT = "tofocous:auth-session-expired";

export type AuthSessionExpiredDetail = {
  message: string;
};

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL não foi definida.");
}

export const authenticatedApi = axios.create({
  baseURL: apiUrl,
});

export const publicApi = axios.create({
  baseURL: apiUrl,
});

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isLoggingOut = false;

export function resetAuthState() {
  isLoggingOut = false;
}

function setAuthorizationHeader(
  config: InternalAxiosRequestConfig,
  token: string
) {
  const headers = AxiosHeaders.from(config.headers);

  headers.set("Authorization", `Bearer ${token}`);

  config.headers = headers;
}

function shouldRefreshToken(token: string) {
  const exp = getTokenExpiration(token);

  if (!exp) return false;

  const now = Math.floor(Date.now() / 1000);

  return exp - now < 45;
}

function emitSessionExpiredEvent() {
  if (typeof window === "undefined") return;

  const event = new CustomEvent<AuthSessionExpiredDetail>(
    AUTH_SESSION_EXPIRED_EVENT,
    {
      detail: {
        message: "Sua sessão expirou. Entre novamente para continuar.",
      },
    }
  );

  window.dispatchEvent(event);
}

function clearAuthState() {
  if (isLoggingOut) return;

  isLoggingOut = true;
  clearTokens();
  supabaseRealtimeClient.realtime.setAuth("");
  emitSessionExpiredEvent();
}

authenticatedApi.interceptors.request.use(async (config) => {
  if (isLoggingOut) {
    return Promise.reject(new Error("Usuário deslogado."));
  }

  let token = getAccessToken();

  if (!token) {
    return config;
  }

  if (shouldRefreshToken(token)) {
    try {
      token = await handleRefresh();
      supabaseRealtimeClient.realtime.setAuth(token);
    } catch (error) {
      clearAuthState();
      return Promise.reject(error);
    }
  }

  setAuthorizationHeader(config, token);

  return config;
});

authenticatedApi.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;

    if (!isUnauthorized || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuthState();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await handleRefresh();

      supabaseRealtimeClient.realtime.setAuth(newToken);
      setAuthorizationHeader(originalRequest, newToken);

      return authenticatedApi(originalRequest);
    } catch (refreshError) {
      clearAuthState();
      return Promise.reject(refreshError);
    }
  }
);

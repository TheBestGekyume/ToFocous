import axios, { type InternalAxiosRequestConfig } from "axios";
import { handleRefresh } from "./refreshService";
import { clearTokens, getAccessToken, getTokenExpiration } from "../utils/tokenUtils";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL não foi definida.");
}

export const api = axios.create({
  baseURL: apiUrl,
});

type CustomAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

let isLoggingOut = false;

export function resetAuthState() {
  isLoggingOut = false;
}

api.interceptors.request.use(async (config) => {
  let token = getAccessToken();

  if (isLoggingOut) {
    return Promise.reject(new Error("User logged out"));
  }

  if (token) {
    const exp = getTokenExpiration(token);

    if (exp) {
      const now = Math.floor(Date.now() / 1000);

      if (exp - now < 45) {
        try {
          token = await handleRefresh();
        } catch (error) {
          if (!isLoggingOut) {
            isLoggingOut = true;
            clearTokens();
          }

          return Promise.reject(error);
        }
      }
    }

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      const newToken = await handleRefresh();
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch {
      if (!isLoggingOut) {
        isLoggingOut = true;
        clearTokens();
      }
      return Promise.reject(error);
    }
  }
);
import axios, { type InternalAxiosRequestConfig } from "axios";
import { handleRefresh } from "./refreshService";
import { clearTokens, getAccessToken, getTokenExpiration } from "../utils/tokenUtils";


export const api = axios.create({
  baseURL: "http://127.0.0.1:8000",
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
        } catch {
          clearTokens();
          // window.location.href = "/acesso";
          throw new Error("Refresh failed");
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

      console.log("novo token:", newToken)

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
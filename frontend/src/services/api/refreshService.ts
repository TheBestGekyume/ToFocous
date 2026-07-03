import axios from "axios";
import { getRefreshToken, setTokens } from "../../utils/tokenUtils";
import type { TApiResponse } from "../../types/TApi";
import { getApiSuccessOrThrow } from "../../types/TApi";

const apiUrl = import.meta.env.VITE_API_URL;

if (!apiUrl) {
  throw new Error("VITE_API_URL não foi definida.");
}

const refreshApi = axios.create({
  baseURL: apiUrl,
});

type RefreshResponse = {
  access_token: string;
  refresh_token: string;
};

let refreshPromise: Promise<string> | null = null;

export async function handleRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        throw new Error("Refresh token não encontrado.");
      }

      const response = await refreshApi.post<TApiResponse<RefreshResponse>>(
        "/auth/refresh/",
        {
          refresh_token: refreshToken,
        }
      );

      const success = getApiSuccessOrThrow(response.data, {
        contentRequired: true,
      });

      const { access_token, refresh_token } = success.content;

      setTokens(access_token, refresh_token);

      return access_token;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
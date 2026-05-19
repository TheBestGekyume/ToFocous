import axios from "axios";

type ApiErrorResponse = {
  detail?: string;
  message?: string;
};

export function getApiErrorMessage(
  error: unknown,
  fallback = "Erro inesperado"
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
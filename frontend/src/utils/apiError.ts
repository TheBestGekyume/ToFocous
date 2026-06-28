import axios from "axios";
import { ApiContentError } from "../types/TApi";
import type { TApiResponse } from "../types/TApi";

export type ApiErrorInfo = {
  message: string;
  httpCode: number | null;
  errorCode: string | null;
  raw: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiResponse(value: unknown): value is TApiResponse<unknown> {
  return (
    isRecord(value) &&
    typeof value.message === "string" &&
    typeof value.http_code === "number" &&
    "content" in value &&
    "error_code" in value
  );
}

function getFastApiDetailMessage(detail: unknown): string | null {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return "Alguns campos foram preenchidos incorretamente.";
  }

  return null;
}

export function getApiErrorInfo(
  error: unknown,
  fallback = "Erro inesperado."
): ApiErrorInfo {
  if (error instanceof ApiContentError) {
    return {
      message: error.message,
      httpCode: error.httpCode,
      errorCode: error.errorCode,
      raw: error,
    };
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data;

    if (isApiResponse(data)) {
      return {
        message: data.message,
        httpCode: data.http_code,
        errorCode: data.error_code,
        raw: data,
      };
    }

    if (isRecord(data)) {
      const detailMessage = getFastApiDetailMessage(data.detail);

      if (detailMessage) {
        return {
          message: detailMessage,
          httpCode: error.response?.status ?? null,
          errorCode: null,
          raw: data,
        };
      }

      if (typeof data.message === "string") {
        return {
          message: data.message,
          httpCode: error.response?.status ?? null,
          errorCode: typeof data.error_code === "string" ? data.error_code : null,
          raw: data,
        };
      }
    }

    return {
      message: fallback,
      httpCode: error.response?.status ?? null,
      errorCode: null,
      raw: data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      httpCode: null,
      errorCode: null,
      raw: error,
    };
  }

  return {
    message: fallback,
    httpCode: null,
    errorCode: null,
    raw: error,
  };
}

export function getApiErrorMessage(
  error: unknown,
  fallback = "Erro inesperado."
): string {
  return getApiErrorInfo(error, fallback).message;
}
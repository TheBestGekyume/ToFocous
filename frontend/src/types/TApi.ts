export type TApiResponse<T> = {
  content: T | null;
  http_code: number;
  message: string;
  error_code: string | null;
};

export type TApiSuccess<T> = {
  content: T;
  httpCode: number;
  message: string;
  errorCode: null;
};

export class ApiResponseError extends Error {
  public readonly httpCode: number;
  public readonly errorCode: string | null;
  public readonly raw: TApiResponse<unknown>;

  constructor(response: TApiResponse<unknown>) {
    super(response.message);

    this.name = "ApiResponseError";
    this.httpCode = response.http_code;
    this.errorCode = response.error_code;
    this.raw = response;
  }
}

type GetApiSuccessOptions = {
  contentRequired?: boolean;
};

export function getApiSuccessOrThrow<T>(
  response: TApiResponse<T>,
  options: { contentRequired: true }
): TApiSuccess<NonNullable<T>>;

export function getApiSuccessOrThrow<T>(
  response: TApiResponse<T>,
  options?: { contentRequired?: false }
): TApiSuccess<T | null>;

export function getApiSuccessOrThrow<T>(
  response: TApiResponse<T>,
  options: GetApiSuccessOptions = {}
): TApiSuccess<NonNullable<T>> | TApiSuccess<T | null> {
  const isHttpSuccess = response.http_code >= 200 && response.http_code < 300;

  if (!isHttpSuccess || response.error_code !== null) {
    throw new ApiResponseError(response);
  }

  if (options.contentRequired && response.content === null) {
    throw new ApiResponseError({
      ...response,
      message: "Resposta da API sem conteúdo obrigatório.",
      error_code: "API_CONTENT_REQUIRED",
    });
  }

  if (options.contentRequired) {
    return {
      content: response.content as NonNullable<T>,
      httpCode: response.http_code,
      message: response.message,
      errorCode: null,
    };
  }

  return {
    content: response.content,
    httpCode: response.http_code,
    message: response.message,
    errorCode: null,
  };
}
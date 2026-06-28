export type TApiResponse<T> = {
  content: T | null;
  http_code: number;
  message: string;
  error_code: string | null;
};

export class ApiContentError extends Error {
  public readonly httpCode: number;
  public readonly errorCode: string | null;

  constructor(response: TApiResponse<unknown>) {
    super(response.message);

    this.name = "ApiContentError";
    this.httpCode = response.http_code;
    this.errorCode = response.error_code;
  }
}

export function requireApiContent<T>(response: TApiResponse<T>): T {
  if (response.content === null) {
    throw new ApiContentError(response);
  }

  return response.content;
}   
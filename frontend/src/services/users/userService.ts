import { authenticatedApi, publicApi } from "../api/api";
import type { TApiResponse, TApiSuccess } from "../../types/TApi";
import { getApiSuccessOrThrow } from "../../types/TApi";
import type {
  TCreatePasswordDTO,
  TEmailChangeRequestResponse,
  TFinalizeEmailChangeResponse,
  TResetPasswordDTO,
  TUpdateEmailDTO,
  TUpdatePasswordDTO,
  TUpdateUserDTO,
  TUpdateUserResponse,
  TUser,
} from "../../types/TUser";

export const getMyUser = async (): Promise<TUser> => {
  const response =
    await authenticatedApi.get<TApiResponse<TUser>>("/usuarios/me/");

  const success = getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });

  return success.content;
};

export const updateMyUser = async (
  payload: TUpdateUserDTO
): Promise<TUpdateUserResponse> => {
  const response = await authenticatedApi.patch<
    TApiResponse<TUpdateUserResponse>
  >("/usuarios/me/", payload);

  const success = getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });

  return success.content;
};

export const updateMyPassword = async (
  payload: TUpdatePasswordDTO
): Promise<TApiSuccess<null>> => {
  const response = await authenticatedApi.patch<TApiResponse<null>>(
    "/usuarios/me/password",
    payload
  );

  return getApiSuccessOrThrow(response.data);
};

export const requestPasswordReset = async (
  payload: TResetPasswordDTO
): Promise<TApiSuccess<null>> => {
  const response = await publicApi.post<TApiResponse<null>>(
    "/usuarios/reset-password",
    payload
  );

  return getApiSuccessOrThrow(response.data);
};

export const updateMyEmail = async (
  payload: TUpdateEmailDTO
): Promise<TApiSuccess<TEmailChangeRequestResponse>> => {
  const response = await authenticatedApi.patch<
    TApiResponse<TEmailChangeRequestResponse>
  >("/usuarios/me/email", payload);

  return getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });
};

export const finalizeMyEmailChange = async (): Promise<
  TApiSuccess<TFinalizeEmailChangeResponse>
> => {
  const response = await authenticatedApi.post<
    TApiResponse<TFinalizeEmailChangeResponse>
  >("/usuarios/me/email/finalize");

  return getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });
};

export const createMyPassword = async (
  payload: TCreatePasswordDTO
): Promise<TApiSuccess<null>> => {
  const response = await authenticatedApi.post<TApiResponse<null>>(
    "/usuarios/me/password/create",
    payload
  );

  return getApiSuccessOrThrow(response.data);
};
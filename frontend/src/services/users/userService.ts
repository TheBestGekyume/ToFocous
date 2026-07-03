import { authenticatedApi } from "../api/api";
import type { TApiResponse, TApiSuccess } from "../../types/TApi";
import { getApiSuccessOrThrow } from "../../types/TApi";
import type {
  TCreatePasswordDTO,
  TResetPasswordDTO,
  TUpdateEmailDTO,
  TUpdatePasswordDTO,
  TUpdateUserDTO,
  TUser,
} from "../../types/TUser";
import { supabaseAuthClient } from "../auth/supabaseAuthClient";

export const getMyUser = async (): Promise<TUser> => {
  const response = await authenticatedApi.get<TApiResponse<TUser>>("/usuarios/me/");
  const success = getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });

  return success.content;
};

export const updateMyUser = async (
  payload: TUpdateUserDTO
): Promise<TUser> => {
  const response = await authenticatedApi.patch<TApiResponse<TUser>>(
    "/usuarios/me/",
    payload
  );

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
  const response = await authenticatedApi.post<TApiResponse<null>>(
    "/usuarios/reset-password",
    payload
  );

  return getApiSuccessOrThrow(response.data);
};

export const updateMyEmail = async (
  payload: TUpdateEmailDTO
): Promise<TApiSuccess<unknown | null>> => {
  const response = await authenticatedApi.patch<TApiResponse<unknown>>(
    "/usuarios/me/email",
    payload
  );

  return getApiSuccessOrThrow(response.data);
};

export const createMyPassword = async (
  payload: TCreatePasswordDTO
): Promise<TApiSuccess<null>> => {
  const { error } = await supabaseAuthClient.auth.updateUser({
    password: payload.new_password,
  });

  if (error) {
    throw error;
  }

  return {
    content: null,
    httpCode: 200,
    message: "Senha criada com sucesso.",
    errorCode: null,
  };
};
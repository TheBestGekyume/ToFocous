import { api } from "../api/api";
import type { TApiResponse } from "../../types/TApi";
import { requireApiContent } from "../../types/TApi";
import type {
  TCreatePasswordDTO,
  TMessageResponse,
  TResetPasswordDTO,
  TUpdateEmailDTO,
  TUpdatePasswordDTO,
  TUpdateUserDTO,
  TUser,
} from "../../types/TUser";
import { supabaseAuthClient } from "../auth/supabaseAuthClient";

export const getMyUser = async (): Promise<TUser> => {
  const response = await api.get<TApiResponse<TUser>>("/usuarios/me/");

  return requireApiContent(response.data);
};

export const updateMyUser = async (
  payload: TUpdateUserDTO
): Promise<TUser> => {
  const response = await api.patch<TApiResponse<TUser>>(
    "/usuarios/me/",
    payload
  );

  return requireApiContent(response.data);
};

export const updateMyPassword = async (
  payload: TUpdatePasswordDTO
): Promise<TMessageResponse> => {
  const response = await api.patch<TApiResponse<TMessageResponse>>(
    "/usuarios/me/password",
    payload
  );

  return requireApiContent(response.data);
};

export const requestPasswordReset = async (
  payload: TResetPasswordDTO
): Promise<TMessageResponse> => {
  const response = await api.post<TApiResponse<TMessageResponse>>(
    "/usuarios/reset-password",
    payload
  );

  return requireApiContent(response.data);
};

export const updateMyEmail = async (
  payload: TUpdateEmailDTO
): Promise<TMessageResponse> => {
  const response = await api.patch<TApiResponse<TMessageResponse>>(
    "/usuarios/me/email",
    payload
  );

  return requireApiContent(response.data);
};

export const createMyPassword = async (
  payload: TCreatePasswordDTO
): Promise<TMessageResponse> => {
  const { error } = await supabaseAuthClient.auth.updateUser({
    password: payload.new_password,
  });

  if (error) {
    throw error;
  }

  return {
    message: "Senha criada com sucesso.",
  };
};
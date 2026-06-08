import { api } from "../api/api";
import type {
  TMessageResponse,
  TResetPasswordDTO,
  TUpdateEmailDTO,
  TUpdatePasswordDTO,
  TUpdateUserDTO,
  TUser,
  TUserResponse,
} from "../../types/TUser";

export const getMyUser = async (): Promise<TUser> => {
  const response = await api.get<TUserResponse>("/usuarios/me/");

  return response.data.data;
};

export const updateMyUser = async (
  payload: TUpdateUserDTO
): Promise<TUser> => {
  const response = await api.patch<TUserResponse>("/usuarios/me/", payload);

  return response.data.data;
};

export const updateMyPassword = async (
  payload: TUpdatePasswordDTO
): Promise<TMessageResponse> => {
  const response = await api.patch<TMessageResponse>(
    "/usuarios/me/password",
    payload
  );

  return response.data;
};

export const requestPasswordReset = async (
  payload: TResetPasswordDTO
): Promise<TMessageResponse> => {
  const response = await api.post<TMessageResponse>(
    "/usuarios/reset-password",
    payload
  );

  return response.data;
};

export const updateMyEmail = async (
  payload: TUpdateEmailDTO
): Promise<TMessageResponse> => {
  const response = await api.patch<TMessageResponse>(
    "/usuarios/me/email",
    payload
  );

  return response.data;
};
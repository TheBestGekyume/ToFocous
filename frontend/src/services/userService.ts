import { api } from "./api";
import type { TUpdateUserDTO, TUser, TUserResponse } from "../types/TUser";

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
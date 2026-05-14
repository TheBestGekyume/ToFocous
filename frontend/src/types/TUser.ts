// src/types/TUser.ts

export type TUser = {
  id: string;
  name: string;
};

export type TUpdateUserDTO = {
  name: string;
};

export type TUserResponse = {
  message: string;
  data: TUser;
};
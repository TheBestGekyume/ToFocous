export type TUser = {
  id: string;
  name: string;
  email?: string;

};

export type TUpdateUserDTO = {
  name: string;
};

export type TUserResponse = {
  message: string;
  data: TUser;
};


export type TUpdatePasswordDTO = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export type TResetPasswordDTO = {
  email: string;
};

export type TUpdateEmailDTO = {
  email: string;
};

export type TMessageResponse = {
  message: string;
};
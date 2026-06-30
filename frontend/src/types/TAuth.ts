export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
};

export type SignUpPayload = {
  name: string;
  email: string;
  password: string;
};

export type SignUpResponse = {
  message: string;
};

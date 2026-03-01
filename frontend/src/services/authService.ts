import { api } from "./api";

// LOGIN

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
};


export async function loginUser(payload: LoginPayload) {
  const response = await api.post<LoginResponse>(
    "/auth/login",
    payload
  );

  return response.data;
}

//REGISTER

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
};

export async function registerUser(payload: RegisterPayload) {
  await api.post("/auth/register", payload);
}
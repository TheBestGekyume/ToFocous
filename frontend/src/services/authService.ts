import { api, resetAuthState } from "./api";
import { setTokens } from "../utils/tokenUtils";

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
  const response = await api.post<LoginResponse>("/auth/login", payload);
  resetAuthState();

  setTokens(response.data.access_token, response.data.refresh_token);
  localStorage.setItem("user_id", response.data.user_id);

  return response.data;
}

export async function signUpUser(payload: {
  username: string;
  email: string;
  password: string;
}) {
  await api.post("/auth/signup", payload);
}
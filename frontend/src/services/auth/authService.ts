import { api, resetAuthState } from "../api/api";
import { setTokens } from "../../utils/tokenUtils";

type LoginPayload = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user_id: string;
};

export const loginUser = async (payload: LoginPayload) => {
  resetAuthState();

  const response = await api.post<LoginResponse>("/auth/login/", payload);

  setTokens(response.data.access_token, response.data.refresh_token);
  localStorage.setItem("user_id", response.data.user_id);

  return response;
}

export const signUpUser = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/signup/", payload);
  return response;
}
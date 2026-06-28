import { api, resetAuthState } from "../api/api";
import { setTokens } from "../../utils/tokenUtils";
import type { TApiResponse } from "../../types/TApi";
import { requireApiContent } from "../../types/TApi";
import type { LoginPayload, LoginResponse, SignUpPayload, SignUpResponse } from "../../types/TAuth";


export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  resetAuthState();

  const response = await api.post<TApiResponse<LoginResponse>>(
    "/auth/login/",
    payload
  );

  const content = requireApiContent(response.data);

  setTokens(content.access_token, content.refresh_token);
  localStorage.setItem("user_id", content.user_id);

  return content;
};

export const signUpUser = async (
  payload: SignUpPayload
): Promise<SignUpResponse> => {
  const response = await api.post<TApiResponse<SignUpResponse>>(
    "/auth/signup/",
    payload
  );

  return requireApiContent(response.data);
};
import { api, resetAuthState } from "../api/api";
import { setTokens } from "../../utils/tokenUtils";
import type { TApiResponse, TApiSuccess } from "../../types/TApi";
import { getApiSuccessOrThrow } from "../../types/TApi";
import type {
  LoginPayload,
  LoginResponse,
  SignUpPayload,
  SignUpResponse,
} from "../../types/TAuth";

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  resetAuthState();

  const response = await api.post<TApiResponse<LoginResponse>>(
    "/auth/login/",
    payload
  );

  const success = getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });

  const content = success.content;

  setTokens(content.access_token, content.refresh_token);
  localStorage.setItem("user_id", content.user_id);

  return content;
};

export const signUpUser = async (
  payload: SignUpPayload
): Promise<TApiSuccess<SignUpResponse>> => {
  const response = await api.post<TApiResponse<SignUpResponse>>(
    "/auth/signup/",
    payload
  );

  return getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });
};
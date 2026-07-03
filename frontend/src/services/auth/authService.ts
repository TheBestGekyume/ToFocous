import { publicApi, resetAuthState } from "../api/api";
import { setTokens, setUserId } from "../../utils/tokenUtils";
import type { TApiResponse, TApiSuccess } from "../../types/TApi";
import { getApiSuccessOrThrow } from "../../types/TApi";
import type {
  LoginPayload,
  LoginResponse,
  SignUpPayload,
  SignUpResponse,
} from "../../types/TAuth";
import { supabaseRealtimeClient } from "../realtime/supabaseRealtimeClient";

export const loginUser = async (
  payload: LoginPayload
): Promise<LoginResponse> => {
  resetAuthState();

  const response = await publicApi.post<TApiResponse<LoginResponse>>(
    "/auth/login/",
    payload
  );

  const success = getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });

  const content = success.content;

  setTokens(content.access_token, content.refresh_token);
  setUserId(content.user_id);

  supabaseRealtimeClient.realtime.setAuth(content.access_token);

  return content;
};

export const signUpUser = async (
  payload: SignUpPayload
): Promise<TApiSuccess<SignUpResponse>> => {
  const response = await publicApi.post<TApiResponse<SignUpResponse>>(
    "/auth/signup/",
    payload
  );

  return getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });
};
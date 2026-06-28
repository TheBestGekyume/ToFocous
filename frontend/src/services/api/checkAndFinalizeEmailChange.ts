import { api } from "./api";
import { supabaseAuthClient } from "../auth/supabaseAuthClient";
import { requireApiContent, type TApiResponse } from "../../types/TApi";

type FinalizeEmailChangeResponse = {
  should_logout?: boolean;
};

export const checkAndFinalizeEmailChange =
  async (): Promise<FinalizeEmailChangeResponse> => {
    const sessionResult = await supabaseAuthClient.auth.getSession();
    const session = sessionResult.data.session;

    if (!session) {
      return { should_logout: false };
    }

    const response = await api.post<TApiResponse<FinalizeEmailChangeResponse>>(
      "/usuarios/me/email/finalize"
    );

    return requireApiContent(response.data);
  };
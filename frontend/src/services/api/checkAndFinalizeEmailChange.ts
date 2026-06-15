import { api } from "./api";
import { supabaseAuthClient } from "../auth/supabaseAuthClient";

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

    const response = await api.post<FinalizeEmailChangeResponse>(
      "/usuarios/me/email/finalize"
    );

    return response.data;
  };
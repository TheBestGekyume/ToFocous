import { authenticatedApi } from "./api";
import { supabaseAuthClient } from "../auth/supabaseAuthClient";
import { getApiSuccessOrThrow, type TApiResponse } from "../../types/TApi";

type GoogleIdentityResultResponse = {
  google_unlinked: boolean;
  reason: string;
};

export type FinalizeEmailChangeResponse = {
  email_change_finalized: boolean;
  should_logout: boolean;
  current_email?: string | null;
  expected_email?: string | null;
  google_identity?: GoogleIdentityResultResponse | null;
};

export const checkAndFinalizeEmailChange =
  async (): Promise<FinalizeEmailChangeResponse> => {
    const sessionResult = await supabaseAuthClient.auth.getSession();
    const session = sessionResult.data.session;

    if (!session) {
      return {
        email_change_finalized: false,
        should_logout: false,
      };
    }

    const response = await authenticatedApi.post<TApiResponse<FinalizeEmailChangeResponse>>(
      "/usuarios/me/email/finalize"
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  };
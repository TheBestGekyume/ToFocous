export type   TUser = {
  id: string;
  name: string;
  email: string | null;
  has_google_auth: boolean;
  has_password: boolean;
};

export type TUpdateUserDTO = {
  name: string;
};

export type TUpdateUserResponse = Pick<TUser, "id" | "name" | "email">;

export type TUpdateEmailDTO = {
  email: string;
};

export type TUpdatePasswordDTO = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export type TCreatePasswordDTO = {
  new_password: string;
  confirm_new_password: string;
};

export type TResetPasswordDTO = {
  email: string;
};

export type TEmailChangeRequestResponse = {
  new_email: string;
  should_unlink_google_after_confirmation: boolean;
  should_finalize_after_redirect: boolean;
};

export type TGoogleIdentityResultResponse = {
  google_unlinked: boolean;
  reason: string;
};

export type TFinalizeEmailChangeResponse = {
  email_change_finalized: boolean;
  google_identity?: TGoogleIdentityResultResponse | null;
  should_logout: boolean;
  current_email?: string | null;
  expected_email?: string | null;
};
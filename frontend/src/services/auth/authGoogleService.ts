import { supabaseAuthClient } from "./supabaseAuthClient";

export const loginWithGoogle = async () => {
  const { error } = await supabaseAuthClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/acesso/callback`,
      queryParams: {
        prompt: "select_account",
      },
    },
  });

  if (error) {
    throw error;
  }
};
import { ShieldCheck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingDots } from "../components/_Common/LoadingDots";
import { checkAndFinalizeEmailChange } from "../services/api/checkAndFinalizeEmailChange";
import { supabaseAuthClient } from "../services/auth/supabaseAuthClient";
import { clearTokens, setTokens, setUserId } from "../utils/tokenUtils";
import { logApiError } from "../utils/apiError";

const hasAuthCallbackParams = (): boolean => {
  const searchParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace("#", ""));

  return (
    searchParams.has("code") ||
    searchParams.has("type") ||
    hashParams.has("access_token") ||
    hashParams.has("refresh_token") ||
    hashParams.has("type")
  );
};

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const alreadyHandled = useRef(false);

  useEffect(() => {
    if (alreadyHandled.current) return;

    alreadyHandled.current = true;

    const handleCallback = async (): Promise<void> => {
      try {
        if (!hasAuthCallbackParams()) {
          navigate("/acesso", { replace: true });
          return;
        }

        const { data, error } = await supabaseAuthClient.auth.getSession();

        if (error) {
          throw error;
        }

        const session = data.session;

        if (!session) {
          throw new Error(
            "Sessão não encontrada após callback de autenticação."
          );
        }

        setTokens(session.access_token, session.refresh_token);
        setUserId(session.user.id);

        const emailChangeResult = await checkAndFinalizeEmailChange();

        if (emailChangeResult.should_logout) {
          await supabaseAuthClient.auth.signOut();

          clearTokens();

          navigate("/acesso", { replace: true });

          return;
        }

        navigate("/", { replace: true });
      } catch (error: unknown) {
        logApiError("Erro no callback de autenticação", error);

        clearTokens();

        navigate("/acesso", { replace: true });
      }
    };

    void handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-body px-4">
      <div className="w-full max-w-sm rounded-2xl border border-secondary/20 bg-background-header p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent">
            <ShieldCheck size={30} />
          </div>

          <h1 className="text-xl font-semibold text-text">Validando acesso</h1>

          <p className="mt-2 text-sm leading-6 text-primary">
            Estamos conferindo suas informações para concluir a autenticação com
            segurança.
          </p>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-accent">
            <span className="text-sm font-medium text-text">
              Aguarde um momento
            </span>
            <LoadingDots />
          </div>
        </div>
      </div>
    </div>
  );
};

import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabaseAuthClient } from "../services/auth/supabaseAuthClient";
import { clearTokens, setTokens, setUserId } from "../utils/tokenUtils";
import { LoadingDots } from "../components/_Common/LoadingDots";

export const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const alreadyHandled = useRef(false);

  useEffect(() => {
    if (alreadyHandled.current) return;
    alreadyHandled.current = true;

    const handleCallback = async () => {
      try {
        const { data, error } = await supabaseAuthClient.auth.getSession();

        if (error) {
          throw error;
        }

        const session = data.session;

        if (!session) {
          throw new Error("Sessão não encontrada após login com Google.");
        }

        setTokens(session.access_token, session.refresh_token);
        setUserId(session.user.id);

        navigate("/", { replace: true });
      } catch (error) {
        console.error("Erro no callback do Google:", error);

        clearTokens();

        navigate("/acesso", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-body">
      <span className="flex items-center justify-center gap-1.5 text-accent">
        <p>Finalizando login</p>
        <LoadingDots />
      </span>
    </div>
  );
};

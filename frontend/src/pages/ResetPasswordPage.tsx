import { useEffect, useState, type ReactNode } from "react";
import { KeyRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingDots } from "../components/_Common/LoadingDots";
import { FeedbackToast } from "../components/_Common/FeedbackToast";
import { supabaseAuthClient } from "../services/auth/supabaseAuthClient";
import { PasswordInput } from "../components/_Common/PasswordInput";

type Feedback = {
  type: "success" | "error";
  message: ReactNode;
};

const inputClass = `
  w-full p-3 rounded-lg bg-zinc-800 border border-transparent text-text
  outline-none disabled:opacity-70 hover:bg-zinc-700 focus:bg-zinc-900
  focus:border-accent transition
`;

const buttonClass = `
  w-full px-4 py-3 rounded-lg bg-accent hover:bg-purple-700
  text-white font-semibold transition flex items-center justify-center gap-2
  disabled:opacity-50
`;

export const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loadingSession, setLoadingSession] = useState(true);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [canResetPassword, setCanResetPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const { data } = supabaseAuthClient.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;

        if (event === "PASSWORD_RECOVERY" && session) {
          setCanResetPassword(true);
          setLoadingSession(false);
        }
      }
    );

    const loadRecoverySession = async (): Promise<void> => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        if (code) {
          const { error } =
            await supabaseAuthClient.auth.exchangeCodeForSession(code);

          if (error) {
            setFeedback({
              type: "error",
              message: "Link de redefinição inválido ou expirado.",
            });
            return;
          }

          setCanResetPassword(true);
          return;
        }

        const hashParams = new URLSearchParams(
          window.location.hash.replace("#", "")
        );

        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken && type === "recovery") {
          const { error } = await supabaseAuthClient.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setFeedback({
              type: "error",
              message: "Link de redefinição inválido ou expirado.",
            });
            return;
          }

          setCanResetPassword(true);
          return;
        }

        const { data: sessionData } =
          await supabaseAuthClient.auth.getSession();

        if (sessionData.session) {
          setCanResetPassword(true);
          return;
        }

        setFeedback({
          type: "error",
          message:
            "Acesse esta página pelo link enviado no e-mail de redefinição de senha.",
        });

        window.setTimeout(() => {
          navigate("/acesso");
        }, 2200);
      } finally {
        if (isMounted) {
          setLoadingSession(false);
        }
      }
    };

    void loadRecoverySession();

    return () => {
      isMounted = false;
      data.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleUpdatePassword = async (): Promise<void> => {
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedPassword || !trimmedConfirmPassword) {
      setFeedback({
        type: "error",
        message: "Preencha a nova senha e a confirmação.",
      });
      return;
    }

    if (trimmedPassword.length < 6) {
      setFeedback({
        type: "error",
        message: "A senha deve ter pelo menos 6 caracteres.",
      });
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setFeedback({
        type: "error",
        message: "A nova senha e a confirmação não conferem.",
      });
      return;
    }

    setUpdatingPassword(true);
    setFeedback(null);

    try {
      const { error } = await supabaseAuthClient.auth.updateUser({
        password: trimmedPassword,
      });

      if (error) {
        setFeedback({
          type: "error",
          message: "Não foi possível atualizar a senha.",
        });
        return;
      }

      setFeedback({
        type: "success",
        message: (
          <span className="flex items-center gap-1.5">
            Senha atualizada com sucesso. Redirecionando para o login
            <LoadingDots />
          </span>
        ),
      });

      setPassword("");
      setConfirmPassword("");

      await supabaseAuthClient.auth.signOut();

      window.setTimeout(() => {
        navigate("/acesso");
      }, 2500);
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <main className="w-full min-h-screen p-4 md:p-8 text-text flex items-center justify-center">
      {feedback && (
        <FeedbackToast type={feedback.type} message={feedback.message} />
      )}

      <section className="w-full max-w-md bg-background-header border border-secondary/40 rounded-2xl shadow-xl p-5 md:p-7 flex flex-col gap-6">
        <header className="flex items-center gap-3">
          <div className="p-3 rounded-full bg-accent/20 text-primary">
            <KeyRound size={28} />
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Resetar senha</h1>
            <p className="text-sm text-primary/80">
              Defina uma nova senha para acessar sua conta.
            </p>
          </div>
        </header>

        {loadingSession ? (
          <p className="text-lg text-accent text-center">
            <span className="text-text">Validando link</span> <LoadingDots />
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="reset-password"
                className="text-sm font-semibold text-primary"
              >
                Nova senha
              </label>

              <PasswordInput
                id="reset-password"
                value={password}
                onChange={setPassword}
                disabled={!canResetPassword || updatingPassword}
                placeholder="Digite sua nova senha"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="reset-confirm-password"
                className="text-sm font-semibold text-primary"
              >
                Confirmar nova senha
              </label>

              <PasswordInput
                id="reset-confirm-password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                disabled={!canResetPassword || updatingPassword}
                placeholder="Confirme sua nova senha"
                className={inputClass}
              />
            </div>

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={!canResetPassword || updatingPassword}
              className={buttonClass}
            >
              {updatingPassword ? <LoadingDots /> : <>Atualizar senha</>}
            </button>
          </div>
        )}
      </section>
    </main>
  );
};

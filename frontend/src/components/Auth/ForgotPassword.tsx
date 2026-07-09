import { useState, type FormEvent } from "react";
import { LoadingDots } from "../_Common/LoadingDots";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import { requestPasswordReset } from "../../services/users/userService";
import { getApiErrorInfo, logApiError } from "../../utils/apiError";
import type { SetAppFeedback } from "../../types/TFeedback";

type ForgotPasswordProps = {
  onBackToLogin: () => void;
  setFeedback: SetAppFeedback;
};

const googleOnlyResetErrorCodes: ReadonlySet<string> = new Set([
  "PASSWORD_RESET_UNAVAILABLE_FOR_GOOGLE_ONLY",
  "GOOGLE_IS_ONLY_LOGIN_METHOD",
  "GOOGLE_ONLY_LOGIN_METHOD",
  "USER_HAS_ONLY_GOOGLE_AUTH",
]);

const isGoogleOnlyResetError = (errorCode: string | null): boolean => {
  return errorCode !== null && googleOnlyResetErrorCodes.has(errorCode);
};

export const ForgotPassword = ({
  onBackToLogin,
  setFeedback,
}: ForgotPasswordProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setFeedback({
        type: "error",
        message: "Informe o e-mail da conta.",
      });
      return;
    }

    setFeedback(null);
    setLoading(true);

    try {
      const response = await requestPasswordReset({
        email: trimmedEmail,
      });

      setFeedback({
        type: "success",
        message: (
          <span className="whitespace-pre-line">
            {`${response.message}\nVerifique a caixa de entrada do e-mail ${trimmedEmail}.`}
          </span>
        ),
      });
    } catch (error: unknown) {
      logApiError("Erro ao solicitar redefinição de senha", error);

      const errorInfo = getApiErrorInfo(
        error,
        "Não foi possível enviar o e-mail de redefinição."
      );

      const message = isGoogleOnlyResetError(errorInfo.errorCode) ? (
        <span className="whitespace-pre-line">
          {
            "Esta conta usa apenas login com Google.\nEntre usando o Google e, depois, crie uma senha em Meu perfil para habilitar o acesso por e-mail e senha."
          }
        </span>
      ) : (
        errorInfo.message
      );

      setFeedback({
        type: "error",
        message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay
        show={loading}
        delayedMessage="Iniciando Servidor"
        showOnlyAfterDelay
      />

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-md bg-zinc-900 text-text px-3 py-2 outline-none border
          border-transparent hover:bg-zinc-800 focus:bg-zinc-950 focus:border-accent transition"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-primary py-2 font-semibold text-background-body hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-1">
              Enviando
              <LoadingDots />
            </span>
          ) : (
            "Redefinir senha"
          )}
        </button>

        <p className="text-sm text-center text-text">
          Sabe sua senha?{" "}
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-accent font-semibold hover:underline"
          >
            Entrar
          </button>
        </p>
      </form>
    </>
  );
};
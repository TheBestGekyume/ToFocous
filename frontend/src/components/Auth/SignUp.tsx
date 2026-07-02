import { useState } from "react";
import { signUpUser } from "../../services/auth/authService";
import { LoadingDots } from "../_Common/LoadingDots";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import { getApiErrorMessage, logApiError } from "../../utils/apiError";
import { PasswordInput } from "../_Common/PasswordInput";
import type { SetAppFeedback } from "../../types/TFeedback";

type SignUpProps = {
  onSwitch: () => void;
  setFeedback: SetAppFeedback;
};

export const SignUp = ({ onSwitch, setFeedback }: SignUpProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (password !== confirmPassword) {
      setFeedback({
        type: "error",
        message: "As senhas não coincidem.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await signUpUser({
        name,
        email,
        password,
      });

      setFeedback({
        type: "success",
        message: (
          <span className="whitespace-pre-line">
            {`${response.message}\nAtive sua conta pelo email ${email}.`}
          </span>
        ),
      });
      window.setTimeout(() => {
        onSwitch();
      }, 5000);
    } catch (error: unknown) {
      logApiError("Erro ao criar conta", error);

      setFeedback({
        type: "error",
        message: getApiErrorMessage(error, "Erro ao criar conta."),
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
          type="text"
          placeholder="Nome de usuário"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md bg-zinc-900 text-text px-3 py-2 outline-none border
          border-transparent hover:bg-zinc-800 focus:bg-zinc-950 focus:border-accent transition"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md bg-zinc-900 text-text px-3 py-2 outline-none border
          border-transparent hover:bg-zinc-800 focus:bg-zinc-950 focus:border-accent transition"
          required
        />

        <PasswordInput
          value={password}
          onChange={setPassword}
          placeholder="Senha"
          required
          className="w-full rounded-md bg-zinc-900 text-text px-3 py-2 outline-none border
          border-transparent hover:bg-zinc-800 focus:bg-zinc-950 focus:border-accent transition"
        />

        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Confirmar senha"
          required
          className="w-full rounded-md bg-zinc-900 text-text px-3 py-2 outline-none border
          border-transparent hover:bg-zinc-800 focus:bg-zinc-950 focus:border-accent transition"
        />

    

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-md bg-primary py-2 font-semibold text-background-body hover:brightness-110 transition disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center justify-center gap-1">
              Criando conta
              <LoadingDots />
            </span>
          ) : (
            "Criar conta"
          )}
        </button>

        <p className="text-sm text-center text-text">
          Já tem conta?{" "}
          <button
            type="button"
            onClick={onSwitch}
            className="text-accent font-semibold hover:underline"
          >
            Entrar
          </button>
        </p>
      </form>
    </>
  );
};

import { useState } from "react";
import { signUpUser } from "../../services/authService";
import axios from "axios";
import { LoadingDots } from "../_Common/LoadingDots";
import { LoadingOverlay } from "../_Common/LoadingOverlay";

export const SignUpForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      await signUpUser({
        name,
        email,
        password,
      });

      setSuccess(
        `Conta criada com sucesso!\n Ative sua conta pelo email ${email}`
      );

      setTimeout(() => {
        onSwitch();
      }, 5000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // console.log("ERRO BACK:", err.response?.data);
        setError(err.response?.data?.detail || "Erro ao criar conta");
      } else {
        setError("Erro inesperado");
      }
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
          className="w-full rounded-md bg-background-body text-text px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md bg-background-body text-text px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md bg-background-body text-text px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          required
        />

        <input
          type="password"
          placeholder="Confirmar senha"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-md bg-background-body text-text px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
          required
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && (
          <p className="whitespace-pre-line text-sm text-green-400">
            {success}
          </p>
        )}

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

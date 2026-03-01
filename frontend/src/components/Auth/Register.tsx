import { useState } from "react";
import { registerUser } from "../../services/authService";

export const RegisterForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [username, setUsername] = useState("");
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
      await registerUser({
        username,
        email,
        password,
      });

      setSuccess("Conta criada com sucesso!");

      // opcional: trocar automaticamente para login após alguns segundos
      setTimeout(() => {
        onSwitch();
      }, 1500);

    } catch (err: unknown) {
      setError("Erro ao criar conta! Problema interno.");
      console.error(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Nome de usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
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
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-primary py-2 font-semibold text-background-body hover:brightness-110 transition disabled:opacity-60"
      >
        {loading ? "Criando..." : "Criar conta"}
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
  );
};
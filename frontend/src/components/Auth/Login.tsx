import { useState } from "react";
import { loginUser } from "../../services/authService";
import { useNavigate } from "react-router-dom";

export const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await loginUser({ email, password });

      // Salvar tokens
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("user_id", data.user_id);
      navigate("/");
      console.log("Login realizado com sucesso");

    } catch (err: unknown) {
      setError("Email ou senha inválidos");
      console.error(err);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-md bg-primary py-2 font-semibold text-background-body hover:brightness-110 transition disabled:opacity-60"
      >
        {loading ? "Entrando..." : "Entrar"}
      </button>

      <p className="text-sm text-center text-text">
        Não tem conta?{" "}
        <button
          type="button"
          onClick={onSwitch}
          className="text-accent font-semibold hover:underline"
        >
          Criar agora
        </button>
      </p>
    </form>
  );
};

export const LoginForm = ({ onSwitch }: { onSwitch: () => void }) => {
  return (
    <>
      <input
        type="email"
        placeholder="Email"
        className="w-full rounded-md bg-background-body text-text px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
        required
      />

      <input
        type="password"
        placeholder="Senha"
        className="w-full rounded-md bg-background-body text-text px-3 py-2 outline-none focus:ring-2 focus:ring-accent"
        required
      />

      <button 
        type="submit"
        className="mt-2 rounded-md bg-primary py-2 font-semibold text-background-body hover:brightness-110 transition"
      >
        Entrar
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
    </>
  );
};
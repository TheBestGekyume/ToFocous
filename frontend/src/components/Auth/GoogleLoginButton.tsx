import { loginWithGoogle } from "../../services/auth/authGoogleService";
import googleIcon from "../../assets/img/googleIcon.svg";

export const GoogleLoginButton = () => {
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error("Erro ao fazer login com Google:", error);
      alert("Não foi possível entrar com Google.");
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className="
    flex items-center justify-center gap-3
    w-full sm:w-fit
    rounded-xl
    bg-black
    px-5 py-3
    transition
    hover:bg-zinc-900
    active:scale-[0.95]
  "
    >
      <img src={googleIcon} alt="Google" className="h-5 w-5 object-contain" />

      <span className="text-sm font-medium">Entrar com Google</span>
    </button>
  );
};

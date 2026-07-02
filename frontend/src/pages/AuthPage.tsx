import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Login } from "../components/Auth/Login";
import { SignUp } from "../components/Auth/SignUp";
import { ForgotPassword } from "../components/Auth/ForgotPassword";
import { useNavigate } from "react-router-dom";
import { getAccessToken, getTokenExpiration } from "../utils/tokenUtils";
import { FeedbackToast } from "../components/_Common/FeedbackToast";
import type { AppFeedback } from "../types/TFeedback";

type AuthMode = "login" | "signUp" | "forgotPassword";

const formVariants: Variants = {
  initial: {
    opacity: 0,
    rotateY: -90,
  },
  animate: {
    opacity: 1,
    rotateY: 0,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    rotateY: 90,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

const authTitleByMode: Record<AuthMode, string> = {
  login: "Entrar",
  signUp: "Criar conta",
  forgotPassword: "Redefinir senha",
};

export const AuthPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [feedback, setFeedback] = useState<AppFeedback | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = getAccessToken();

    if (!token) return;

    const exp = getTokenExpiration(token);
    const now = Math.floor(Date.now() / 1000);

    if (exp && exp > now) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 6000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const handleChangeMode = (newMode: AuthMode) => {
    setFeedback(null);
    setMode(newMode);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-body perspective-1000 px-4">
      {feedback && (
        <FeedbackToast type={feedback.type} message={feedback.message} />
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-md bg-secondary rounded-xl shadow-lg shadow-background-header px-6 py-4"
        >
          <h1 className="text-2xl font-bold text-center mb-6 text-text">
            {authTitleByMode[mode]}
          </h1>

          {mode === "login" && (
            <Login
              onSwitch={() => handleChangeMode("signUp")}
              onForgotPassword={() => handleChangeMode("forgotPassword")}
              setFeedback={setFeedback}
            />
          )}

          {mode === "signUp" && (
            <SignUp
              onSwitch={() => handleChangeMode("login")}
              setFeedback={setFeedback}
            />
          )}

          {mode === "forgotPassword" && (
            <ForgotPassword
              onBackToLogin={() => handleChangeMode("login")}
              setFeedback={setFeedback}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { LoginForm } from "../components/Auth/Login";
import { RegisterForm } from "../components/Auth/Register";
type AuthMode = "login" | "register";

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


export const Auth = () => {
  const [mode, setMode] = useState<AuthMode>("login");

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-body perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={formVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full max-w-md bg-secondary rounded-xl shadow-xl p-6"
        >
          <h1 className="text-2xl font-bold text-center mb-6 text-text">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>

          {mode === "login" ? (
              <LoginForm onSwitch={() => setMode("register")} />
          ) : (
              <RegisterForm onSwitch={() => setMode("login")} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};


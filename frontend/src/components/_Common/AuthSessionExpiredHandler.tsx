import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AUTH_SESSION_EXPIRED_EVENT,
  type AuthSessionExpiredDetail,
} from "../../services/api/api";
import { FeedbackToast } from "./FeedbackToast";
import type { AppFeedback } from "../../types/TFeedback";

export const AuthSessionExpiredHandler = () => {
  const navigate = useNavigate();

  const [feedback, setFeedback] = useState<AppFeedback | null>(null);

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<AuthSessionExpiredDetail>;

      setFeedback({
        type: "error",
        message:
          customEvent.detail?.message ||
          "Sua sessão expirou. Entre novamente para continuar.",
      });

      navigate("/acesso", {
        replace: true,
      });
    };

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, handleSessionExpired);

    return () => {
      window.removeEventListener(
        AUTH_SESSION_EXPIRED_EVENT,
        handleSessionExpired
      );
    };
  }, [navigate]);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  if (!feedback) return null;

  return <FeedbackToast type={feedback.type} message={feedback.message} />;
};
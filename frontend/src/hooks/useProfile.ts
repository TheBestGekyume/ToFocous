import { useEffect, useState } from "react";
import { useUser } from "./useUser";
import {
  requestPasswordReset,
  updateMyEmail,
  updateMyPassword,
} from "../services/users/userService";

type ProfileFeedback = {
  type: "success" | "error";
  message: string;
};

export const useProfile = () => {
  const { user, loading, updating, fetchMyUser, updateUser } = useUser();

  const [name, setName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [resetEmail, setResetEmail] = useState("");

  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [resetError, setResetError] = useState("");

  const [feedback, setFeedback] = useState<ProfileFeedback | null>(null);

  useEffect(() => {
    fetchMyUser();
  }, [fetchMyUser]);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  useEffect(() => {
    if (!user) return;

    setName(user.name);

    if (user.email) {
      setEmail(user.email);
      setNewEmail(user.email);
      setResetEmail(user.email);
    }
  }, [user]);

  const handleCancelNameEdit = () => {
    if (!user) return;

    setName(user.name);
    setNameError("");
    setIsEditingName(false);
  };

  const handleCancelEmailEdit = () => {
    setNewEmail(email);
    setEmailError("");
    setIsEditingEmail(false);
  };

  const handleUpdateUser = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setNameError("O nome não pode ficar vazio.");
      return;
    }

    if (trimmedName === user?.name) {
      setIsEditingName(false);
      return;
    }

    setNameError("");
    setFeedback(null);

    try {
      await updateUser({
        name: trimmedName,
      });

      setFeedback({
        type: "success",
        message: "Nome atualizado com sucesso.",
      });

      setIsEditingName(false);
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível atualizar o nome.",
      });
    }
  };

  const handleUpdateEmail = async () => {
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail) {
      setEmailError("O e-mail não pode ficar vazio.");
      return;
    }

    if (email && trimmedEmail === email) {
      setEmailError("Informe um e-mail diferente do atual.");
      return;
    }

    setEmailError("");
    setFeedback(null);
    setIsUpdatingEmail(true);

    try {
      const response = await updateMyEmail({
        email: trimmedEmail,
      });

      setFeedback({
        type: "success",
        message: response.message,
      });

      setIsEditingEmail(false);
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível solicitar a troca de e-mail.",
      });
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordError("Preencha todos os campos de senha.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordError("A nova senha e a confirmação não conferem.");
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError("A nova senha não pode ser igual à senha atual.");
      return;
    }

    setPasswordError("");
    setFeedback(null);
    setIsUpdatingPassword(true);

    try {
      const response = await updateMyPassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_new_password: confirmNewPassword,
      });

      setFeedback({
        type: "success",
        message: response.message,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível atualizar a senha.",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    const trimmedEmail = resetEmail.trim();

    if (!trimmedEmail) {
      setResetError("Informe o e-mail para redefinir a senha.");
      return;
    }

    setResetError("");
    setFeedback(null);
    setIsSendingReset(true);

    try {
      const response = await requestPasswordReset({
        email: trimmedEmail,
      });

      setFeedback({
        type: "success",
        message: response.message,
      });
    } catch {
      setFeedback({
        type: "error",
        message: "Não foi possível enviar a solicitação de redefinição.",
      });
    } finally {
      setIsSendingReset(false);
    }
  };

  return {
    userState: {
      user,
      loading,
      updating,
    },

    nameState: {
      name,
      setName,
      isEditingName,
      setIsEditingName,
      nameError,
      handleCancelNameEdit,
      handleUpdateUser,
    },

    emailState: {
      email,
      newEmail,
      setNewEmail,
      isEditingEmail,
      setIsEditingEmail,
      isUpdatingEmail,
      emailError,
      handleCancelEmailEdit,
      handleUpdateEmail,
    },

    passwordState: {
      currentPassword,
      setCurrentPassword,
      newPassword,
      setNewPassword,
      confirmNewPassword,
      setConfirmNewPassword,
      isUpdatingPassword,
      passwordError,
      handleUpdatePassword,
    },

    resetPasswordState: {
      resetEmail,
      setResetEmail,
      isSendingReset,
      resetError,
      handleRequestPasswordReset,
    },

    feedback,
  };
};
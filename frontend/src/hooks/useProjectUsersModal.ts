import { useEffect, useState } from "react";
import { useProjectUsers } from "./useProjectUsers";
import type { AppFeedback } from "../types/TFeedback";
import { getApiErrorMessage } from "../utils/apiError";

type UseProjectUsersModalProps = {
  isOpen: boolean;
  projectId: string;
  isOwner: boolean;
  onClose: () => void;
  onLeaveProject?: () => void;
};

export const useProjectUsersModal = ({
  isOpen,
  projectId,
  isOwner,
  onClose,
  onLeaveProject,
}: UseProjectUsersModalProps) => {
  const {
    projectUsers,
    loading,
    fetchProjectUsers,
    addProjectUser,
    removeProjectUser,
    leaveProject,
  } = useProjectUsers(projectId);

  const [userId, setUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [feedback, setFeedback] = useState<AppFeedback | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFeedback(null);

    void fetchProjectUsers().catch((error: unknown) => {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(error),
      });
    });
  }, [isOpen, fetchProjectUsers]);

  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const handleAddUser = async () => {
    const trimmedUserId = userId.trim();

    if (!trimmedUserId || !isOwner) return;

    setFeedback(null);
    setSubmitting(true);

    try {
      const message = await addProjectUser(trimmedUserId);

      setUserId("");

      if (message) {
        setFeedback({
          type: "success",
          message,
        });
      }
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(error),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUser = async (targetUserId: string) => {
    if (!isOwner) return;

    const confirmed = window.confirm(
      "Remover este usuário do projeto?"
    );

    if (!confirmed) return;

    setFeedback(null);

    try {
      const message = await removeProjectUser(targetUserId);

      if (message) {
        setFeedback({
          type: "success",
          message,
        });
      }
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(error),
      });
    }
  };

  const handleLeaveProject = async () => {
    if (isOwner) return;

    const confirmed = window.confirm("Deseja sair deste projeto?");

    if (!confirmed) return;

    setFeedback(null);
    setLeaving(true);

    try {
      const message = await leaveProject();

      if (message) {
        setFeedback({
          type: "success",
          message,
        });
      }

      onLeaveProject?.();
      onClose();
    } catch (error: unknown) {
      setFeedback({
        type: "error",
        message: getApiErrorMessage(error),
      });
    } finally {
      setLeaving(false);
    }
  };

  const handleClose = () => {
    setUserId("");
    setFeedback(null);
    onClose();
  };

  return {
    projectUsers,
    loading,

    userId,
    setUserId,

    submitting,
    leaving,
    feedback,

    handleAddUser,
    handleRemoveUser,
    handleLeaveProject,
    handleClose,
  };
};
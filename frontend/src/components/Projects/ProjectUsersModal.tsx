import { useEffect, useState } from "react";
import { Trash2, UserRoundPlus } from "lucide-react";
import { useProjectUsers } from "../../hooks/useProjectUsers";
import { LoadingDots } from "../_Common/LoadingDots";
import { Modal } from "../_Common/Modal";

type Props = {
  isOpen: boolean;
  projectId: string;
  projectTitle: string;
  onClose: () => void;
};

export const ProjectUsersModal = ({
  isOpen,
  projectId,
  projectTitle,
  onClose,
}: Props) => {
  const {
    projectUsers,
    loading,
    fetchProjectUsers,
    addProjectUser,
    removeProjectUser,
  } = useProjectUsers(projectId);

  const [userId, setUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    fetchProjectUsers();
  }, [isOpen, fetchProjectUsers]);

  const handleAddUser = async () => {
    const trimmedUserId = userId.trim();

    if (!trimmedUserId) return;

    setSubmitting(true);

    try {
      await addProjectUser(trimmedUserId);
      setUserId("");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUser = async (targetUserId: string) => {
    const confirmed = confirm("Remover este usuário do projeto?");

    if (!confirmed) return;

    await removeProjectUser(targetUserId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Usuários do projeto"
      subtitle={projectTitle}
      size="sm"
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2 text-primary">
          <UserRoundPlus size={22} />
          <span className="font-semibold">Gerenciar usuários</span>
        </div>

        <div className="flex gap-2">
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="ID do usuário"
            className="
              w-full rounded-md border border-secondary/30 bg-background-body
              p-2 text-text outline-none transition focus:border-accent
            "
          />

          <button
            type="button"
            onClick={handleAddUser}
            disabled={submitting || !userId.trim()}
            className="
              rounded-md bg-accent px-4 py-2 font-semibold text-white
              transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50
            "
          >
            Adicionar
          </button>
        </div>

        <div className="flex max-h-80 flex-col gap-2 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-md text-text/70">
              Carregando usuários <LoadingDots />
            </p>
          ) : projectUsers.length === 0 ? (
            <p className="text-sm text-text/70">
              Nenhum usuário adicionado a este projeto.
            </p>
          ) : (
            projectUsers.map((projectUser) => (
              <div
                key={projectUser.id}
                className="
                  flex items-center justify-between gap-3 rounded-md
                  border border-secondary/20 bg-background-body p-3
                "
              >
                <div className="min-w-0">
                  <p className="font-semibold text-text">
                    {projectUser.usuarios?.name ?? "Usuário sem nome"}
                  </p>

                  <p className="break-all text-xs text-text/60">
                    {projectUser.user_id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveUser(projectUser.user_id)}
                  className="
                    shrink-0 rounded-full bg-red-500 p-2 text-white
                    transition hover:bg-red-700
                  "
                  title="Remover usuário"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
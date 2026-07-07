import { LogOut, Trash2, UsersRound, UserRoundCog } from "lucide-react";
import { LoadingDots } from "../_Common/LoadingDots";
import { Modal } from "../_Common/Modal";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import { FeedbackToast } from "../_Common/FeedbackToast";
import { useProjectUsersModal } from "../../hooks/useProjectUsersModal";

type Props = {
  isOpen: boolean;
  projectId: string;
  projectTitle: string;
  isOwner: boolean;
  onClose: () => void;
  onLeaveProject?: () => void;
};

export const ProjectUsersModal = ({
  isOpen,
  projectId,
  projectTitle,
  isOwner,
  onClose,
  onLeaveProject,
}: Props) => {
  const {
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
  } = useProjectUsersModal({
    isOpen,
    projectId,
    isOwner,
    onClose,
    onLeaveProject,
  });

  return (
    <>
      <LoadingOverlay show={loading} showOnlyAfterDelay />

      {feedback && (
        <FeedbackToast
          type={feedback.type}
          message={feedback.message}
        />
      )}

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Usuários do projeto"
        subtitle={projectTitle}
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-2 text-primary">
            {isOwner ? (
              <UserRoundCog size={22} />
            ) : (
              <UsersRound size={22} />
            )}

            <span className="font-semibold">
              {isOwner
                ? "Gerenciar usuários"
                : "Usuários do projeto"}
            </span>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="ID do usuário"
                disabled={submitting}
                className="
                  w-full rounded-md border border-transparent
                  bg-zinc-800 p-2 text-text outline-none transition
                  hover:bg-zinc-700 focus:border-accent focus:bg-zinc-900
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              />

              <button
                type="button"
                onClick={handleAddUser}
                disabled={submitting || !userId.trim()}
                className="
                  rounded-md bg-accent px-4 py-2 font-semibold
                  text-white transition hover:opacity-80
                  disabled:cursor-not-allowed disabled:opacity-50
                "
              >
                {submitting ? "Adicionando..." : "Adicionar"}
              </button>
            </div>
          )}

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
                    flex items-center justify-between gap-3
                    rounded-md border border-secondary/20
                    bg-background-body p-3
                  "
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-text">
                      {projectUser.user?.name ?? "Usuário sem nome"}
                    </p>

                    <p className="break-all text-xs text-text/60">
                      {projectUser.user_id}
                    </p>
                  </div>

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRemoveUser(projectUser.user_id)
                      }
                      className="
                        shrink-0 rounded-full bg-red-500 p-2
                        text-white transition hover:bg-red-700
                      "
                      title="Remover usuário"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {!isOwner && (
            <button
              type="button"
              onClick={handleLeaveProject}
              disabled={leaving}
              className="
                flex items-center justify-center gap-2 rounded-md
                bg-red-500 px-4 py-2 font-semibold text-white
                transition hover:bg-red-700
                disabled:cursor-not-allowed disabled:opacity-50
              "
            >
              <LogOut size={18} />

              {leaving ? "Saindo..." : "Sair do projeto"}
            </button>
          )}
        </div>
      </Modal>
    </>
  );
};
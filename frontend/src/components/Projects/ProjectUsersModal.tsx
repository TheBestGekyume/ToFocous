import { useEffect, useState } from "react";
import { Trash2, UserRoundPlus, X } from "lucide-react";
import { useProjectUsers } from "../../hooks/useProjectUsers";

type Props = {
  projectId: string;
  projectTitle: string;
  onClose: () => void;
};

export const ProjectUsersModal = ({
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
    fetchProjectUsers();
  }, [fetchProjectUsers]);

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
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl shadow-xl w-full max-w-lg p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <UserRoundPlus size={22} />
              <h2 className="text-2xl font-bold">Usuários do projeto</h2>
            </div>

            <p className="text-sm text-zinc-400 mt-1">{projectTitle}</p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex gap-2">
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="ID do usuário"
            className="w-full p-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:border-accent outline-none"
          />

          <button
            onClick={handleAddUser}
            disabled={submitting || !userId.trim()}
            className="px-4 py-2 rounded-md bg-accent hover:bg-purple-700 disabled:opacity-50 font-semibold"
          >
            Adicionar
          </button>
        </div>

        <div className="flex flex-col gap-2 max-h-80 overflow-y-auto pr-1">
          {loading ? (
            <p className="text-sm text-zinc-400">Carregando usuários...</p>
          ) : projectUsers.length === 0 ? (
            <p className="text-sm text-zinc-400">
              Nenhum usuário adicionado a este projeto.
            </p>
          ) : (
            projectUsers.map((projectUser) => (
              <div
                key={projectUser.id}
                className="flex items-center justify-between gap-3 bg-zinc-800 border border-zinc-700 rounded-md p-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-white">
                    {projectUser.name ?? "Usuário sem nome"}
                  </p>

                  <p className="text-xs text-zinc-400 break-all">
                    {projectUser.user_id}
                  </p>
                </div>

                <button
                  onClick={() => handleRemoveUser(projectUser.user_id)}
                  className="p-2 rounded-full bg-red-500 hover:bg-red-700 transition shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
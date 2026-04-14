import { useState } from "react";
import { useProjects } from "../../hooks/useProjects";
import type { TProject } from "../../types/TProject";

type Props = {
  onClose: () => void;
  mode: "create" | "edit";
  project?: TProject;
};

export const ProjectForm = ({ onClose, mode, project }: Props) => {
  const { createProject, updateProject, deleteProject } = useProjects();

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(
    project?.description ?? ""
  );
  const [color, setColor] = useState(
    project?.color ?? "#4a2675"
  );
  const [loading, setLoading] = useState(false);

  const isEdit = mode === "edit";

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (isEdit && project) {
        await updateProject(project.id, {
          title,
          description,
          color,
        });
      } else {
        await createProject({ title, description, color });
      }

      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!project) return;

    setLoading(true);
    try {
      await deleteProject(project.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md flex flex-col gap-4 border border-zinc-700 shadow-xl">
        <h2 className="text-xl font-bold text-white">
          {isEdit ? "Editar Projeto" : "Novo Projeto"}
        </h2>

        <input
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:border-accent outline-none"
        />

        <input
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-2 rounded-md bg-zinc-800 text-white border border-zinc-600 focus:border-accent outline-none"
        />

        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">
            Cor do projeto
          </span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border-none"
          />
        </div>

        <div className="flex justify-between mt-2">
          {/* DELETE (só no edit) */}
          {isEdit && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="text-red-500 hover:underline"
            >
              Deletar
            </button>
          )}

          <div className="flex gap-2 ml-auto">
            <button
              onClick={onClose}
              disabled={loading}
              className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-md"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-accent hover:bg-purple-700 px-4 py-2 rounded-md font-semibold"
            >
              {isEdit ? "Salvar" : "Criar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
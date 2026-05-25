import { useState } from "react";
import { useProjects } from "../../hooks/useProjects";
import type { TProject } from "../../types/TProject";

type Props = {
  onClose: () => void;
  mode: "create" | "edit";
  project?: TProject;
};

export const ProjectForm = ({ onClose, mode, project }: Props) => {
  const { createProject, updateProject } = useProjects();

  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [color, setColor] = useState(project?.color ?? "#4a2675");
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
        await createProject({
          title,
          description,
          color,
        });
      }

      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <input
        placeholder="Título"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        className="
          rounded-md border border-transparent bg-zinc-800 p-2
          text-text outline-none transition hover:bg-zinc-700 
          focus:bg-zinc-900 focus:border-accent
        "
      />

      <input
        placeholder="Descrição"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        className="
          rounded-md border border-transparent bg-zinc-800 p-2
          text-text outline-none transition hover:bg-zinc-700 
          focus:bg-zinc-900 focus:border-accent
        "
      />

      <div className="flex items-center justify-between gap-4">
        <span className="font-semibold text-text">Cor do Projeto</span>

        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-10 w-10 cursor-pointer rounded border-none bg-transparent"
        />
      </div>

      <div className="mt-2 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="
            w-full rounded-md bg-background-body px-4 py-2 text-text
            transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          Cancelar
        </button>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className="
            w-full rounded-md bg-accent px-4 py-2 font-semibold text-white
            transition hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {loading ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
        </button>
      </div>
    </div>
  );
};
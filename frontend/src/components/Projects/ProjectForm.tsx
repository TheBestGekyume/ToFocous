import { useEffect, useRef, useState } from "react";
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

  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    const textarea = descriptionRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [description]);

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();

    if (!normalizedTitle) return;

    setLoading(true);

    try {
      if (isEdit && project) {
        await updateProject(project.id, {
          title: normalizedTitle,
          description: normalizedDescription,
          color,
        });
      } else {
        await createProject({
          title: normalizedTitle,
          description: normalizedDescription,
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
      <fieldset className="flex flex-col gap-1">
        <label htmlFor="titleInput" className="font-semibold text-text">
          Título do Projeto <span className="text-red-500">*</span>
        </label>
        <input
          id="titleInput"
          placeholder="Insira o Título"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="
          rounded-md border border-transparent bg-zinc-800 p-2
          text-text outline-none transition hover:bg-zinc-700
          focus:border-accent focus:bg-zinc-900
        "
        />
      </fieldset>

      <fieldset className="flex flex-col gap-1  ">
        <label htmlFor="descriptionInput" className="font-semibold text-text">
          Descrição do Projeto <span className="text-zinc-400">(Opcional)</span>
        </label>
        <textarea
          id="descriptionInput"
          ref={descriptionRef}
          placeholder="Insira a Descrição"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={4}
          className="
          resize-none overflow-hidden rounded-md
          border border-transparent bg-zinc-800 p-2
          text-text outline-none transition hover:bg-zinc-700
          focus:border-accent focus:bg-zinc-900
        "
        />
      </fieldset>

      <fieldset className="flex items-end justify-end gap-4">
        <label htmlFor="colorInput" className="font-semibold text-text">
          Cor do Projeto
        </label>

        <input
          id="colorInput"
          type="color"
          title="Selecione a Cor do Projeto"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="h-10 w-10 cursor-pointer rounded border-none bg-transparent"
        />
      </fieldset>

      <div className="mt-2 flex gap-4">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="
            w-full rounded-md bg-background-body px-4 py-2 text-text
            transition hover:opacity-80
            disabled:cursor-not-allowed disabled:opacity-50
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
            transition hover:opacity-80
            disabled:cursor-not-allowed disabled:opacity-50
          "
        >
          {loading ? "Salvando..." : isEdit ? "Salvar" : "Criar"}
        </button>
      </div>
    </div>
  );
};

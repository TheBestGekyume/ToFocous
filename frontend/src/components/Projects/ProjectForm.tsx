import { useState } from "react";
import { useProjects } from "../../hooks/useProjects";

type Props = {
  onClose: () => void;
};

export const ProjectForm = ({ onClose }: Props) => {
  const { createProject } = useProjects();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#4a2675");

  const handleSubmit = async () => {
    await createProject({ title, description, color });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md flex flex-col gap-4 border border-zinc-700 shadow-xl">
        <h2 className="text-xl font-bold text-white">Novo Projeto</h2>

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
          <span className="text-sm text-zinc-400">Cor do projeto</span>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border-none"
          />
        </div>

        <div className="flex justify-end gap-2 mt-2">
          <button
            onClick={onClose}
            className="bg-zinc-700 hover:bg-zinc-600 px-4 py-2 rounded-md"
          >
            Cancelar
          </button>

          <button
            onClick={handleSubmit}
            className="bg-accent hover:bg-purple-700 px-4 py-2 rounded-md font-semibold"
          >
            Criar
          </button>
        </div>
      </div>
    </div>
  );
};

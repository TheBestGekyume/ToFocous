import { useState } from "react";
import type { TProject } from "../../types/TProject";
import { useProjects } from "../../hooks/useProjects";
import { useNavigate } from "react-router-dom";

type Props = {
  project: TProject;
};

export const ProjectItem = ({ project }: Props) => {
  const { updateProject, deleteProject } = useProjects();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);

  const handleSave = async () => {
    await updateProject(project.id, { title, description });
    setEditing(false);
  };

  return (
    <div
      className="p-4 rounded-xl shadow-md cursor-pointer transition"
      style={{
        backgroundColor: project.color + "20",
        border: `2px solid ${project.color}`,
      }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      {editing ? (
        <div
          className="flex flex-col gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 rounded text-black"
          />

          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-2 rounded text-black"
          />

          <div className="flex gap-2">
            <button onClick={handleSave}>Salvar</button>
            <button onClick={() => setEditing(false)}>Cancelar</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-bold">{project.title}</h3>
          <p className="text-sm">{project.description}</p>

          <div className="flex gap-2 mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setEditing(true);
              }}
            >
              Editar
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteProject(project.id);
              }}
            >
              Deletar
            </button>
          </div>
        </>
      )}
    </div>
  );
};

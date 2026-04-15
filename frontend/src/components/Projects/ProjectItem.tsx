import { useNavigate } from "react-router-dom";
import type { TProject } from "../../types/TProject";
import { Pencil, Trash2 } from "lucide-react";
import { useProjects } from "../../hooks/useProjects";

type Props = {
  project: TProject;
  onEdit: (project: TProject) => void;
};

export const ProjectItem = ({ project, onEdit }: Props) => {
  const navigate = useNavigate();

  const { deleteProject } = useProjects();

  return (
    <div
      className="relative p-4 rounded-xl shadow-md cursor-pointer duration-300 hover:scale-105"
      style={{
        backgroundColor: project.color + "75",
        border: `2px solid ${project.color}`,
      }}
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="flex justify-between items-center ">
        <div>
          <h2 className="text-xl font-bold mb-2">
            {project.title[0].toUpperCase() + project.title.substring(1)}
          </h2>
          <p className="text-sm text-zinc-300">{project.description}</p>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-2 ps-2">
          {/* EDIT */}
          <button
            className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-600 transition shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
          >
            <Pencil size={16} />
          </button>

          {/* DELETE */}
          <button
            className="p-2 rounded-full bg-red-500 hover:bg-red-700 transition shadow-md"
            onClick={(e) => {
              e.stopPropagation();

              if (confirm("Tem certeza?")) {
                deleteProject(project.id);
              }
            }}
          >
            <Trash2 size={16} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

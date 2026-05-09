// src/components/Projects/ProjectItem.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TProject } from "../../types/TProject";
import { ArrowLeft, Pencil, Trash2, UserRoundPlus } from "lucide-react";
import { useProjects } from "../../hooks/useProjects";
import { ProjectUsersModal } from "./ProjectUsersModal";

type Props = {
  project: TProject;
  onEdit?: (project: TProject) => void;
  showActions?: boolean;
};

export const ProjectItem = ({ project, onEdit, showActions = true }: Props) => {
  const navigate = useNavigate();
  const { deleteProject } = useProjects();

  const [showUsersModal, setShowUsersModal] = useState(false);

  const handleProjectClick = () => {
    if (showActions) {
      navigate(`/projects/${project.id}`);
      return;
    }

    setShowUsersModal(true);
  };

  return (
    <>
      <div
        className={`relative p-4 rounded-xl shadow-md duration-300 hover:scale-105 cursor-pointer ${
          showActions ? "" : "w-max mx-auto"
        }`}
        style={{
          backgroundColor: project.color + "75",
          border: `2px solid ${project.color}`,
        }}
        onClick={handleProjectClick}
      >
        <div className="flex justify-between items-center">
          {!showActions && (
            <button
              className="p-2 me-5 bg-zinc-700/75 hover:bg-zinc-800/75 duration-300 w-fit rounded-full h-fit"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/projects/`);
              }}
            >
              <ArrowLeft size={24} />
            </button>
          )}

          <div className="flex items-center">
            {showActions && (
              <button
                className="p-2 rounded-full bg-blue-500 hover:bg-blue-700 transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUsersModal(true);
                }}
              >
                <UserRoundPlus size={16} className="text-white" />
              </button>
            )}

            <div className="w-full text-start px-3">
              <h2 className="text-xl font-bold mb-2">
                {project.title[0].toUpperCase() + project.title.substring(1)}
              </h2>

              <p className="text-sm text-zinc-300">{project.description}</p>
            </div>
          </div>

          {showActions && (
            <div className="flex flex-col gap-2 ps-2">
              <button
                className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-600 transition shadow-md"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.(project);
                }}
              >
                <Pencil size={16} />
              </button>

              <button
                className="p-2 rounded-full bg-red-500 hover:bg-red-700 transition shadow-md"
                onClick={(e) => {
                  e.stopPropagation();

                  if (
                    confirm(
                      `O Projeto ${project.title} e todas as tarefas e subtarefas serão PERMANENTEMENTE excluídos. Deseja continuar?`
                    )
                  ) {
                    deleteProject(project.id);
                  }
                }}
              >
                <Trash2 size={16} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      {showUsersModal && (
        <ProjectUsersModal
          projectId={project.id}
          projectTitle={project.title}
          onClose={() => setShowUsersModal(false)}
        />
      )}
    </>
  );
};
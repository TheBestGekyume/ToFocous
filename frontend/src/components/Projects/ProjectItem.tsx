import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { TProject } from "../../types/TProject";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  UserRoundCog,
  UsersRound,
} from "lucide-react";
import { useProjects } from "../../hooks/useProjects";
import { ProjectUsersModal } from "./ProjectUsersModal";

type Props = {
  project: TProject;
  onEdit?: (project: TProject) => void;
  singleProjectItem?: boolean;
};

export const ProjectItem = ({
  project,
  onEdit,
  singleProjectItem = false,
}: Props) => {
  const navigate = useNavigate();
  const { deleteProject, fetchProjects } = useProjects();

  const [showUsersModal, setShowUsersModal] = useState(false);

  const isOwner = project.is_owner;

  const handleProjectClick = () => {
    if (!singleProjectItem) {
      navigate(`/projects/${project.id}`);
      return;
    }

    setShowUsersModal(true);
  };

  return (
    <>
      <div
        className={`relative h-full min-h-28 p-4 rounded-xl shadow-md duration-300 hover:scale-[1.02] cursor-pointer ${
          singleProjectItem ? "w-fit max-w-full mx-auto" : ""
        }`}
        style={{
          backgroundColor: project.color + "75",
          border: `2px solid ${project.color}`,
        }}
        onClick={handleProjectClick}
      >
        <div className="flex h-full justify-between gap-3">
          <div className="flex min-w-0 items-center">
            {singleProjectItem && (
              <button
                type="button"
                className="p-2 me-5 bg-zinc-700/75 hover:bg-zinc-800/75 duration-300 w-fit rounded-full h-fit"
                onClick={(event) => {
                  event.stopPropagation();
                  navigate("/projects/");
                }}
              >
                <ArrowLeft size={24} />
              </button>
            )}

            {!singleProjectItem && (
              <button
                type="button"
                className="shrink-0 p-2 rounded-full bg-blue-500 hover:bg-blue-700 transition"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowUsersModal(true);
                }}
                title={isOwner ? "Gerenciar usuários" : "Ver usuários"}
              >
                {isOwner ? (
                  <UserRoundCog size={18} />
                ) : (
                  <UsersRound size={18} />
                )}
              </button>
            )}

            <div className="min-w-0 text-start px-3">
              <h2
                className={`text-xl font-bold mb-2 ${
                  singleProjectItem ? "" : "line-clamp-2"
                }`}
              >
                {project.title[0].toUpperCase() + project.title.substring(1)}
              </h2>

              <p
                className={`text-sm text-zinc-300 ${
                  singleProjectItem ? "text-wrap" : "line-clamp-2"
                }`}
              >
                {project.description}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex shrink-0 flex-col gap-2 ps-2 justify-center">
              <button
                type="button"
                className="p-2 rounded-full bg-yellow-400 hover:bg-yellow-600 transition shadow-md"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit?.(project);
                }}
                title="Editar projeto"
              >
                <Pencil size={18} />
              </button>

              <button
                type="button"
                className="p-2 rounded-full bg-red-500 hover:bg-red-700 transition shadow-md"
                onClick={(event) => {
                  event.stopPropagation();

                  const confirmed = confirm(
                    `O Projeto ${project.title} e todas as tarefas e subtarefas serão PERMANENTEMENTE excluídos. Deseja continuar?`
                  );

                  if (confirmed) {
                    deleteProject(project.id);
                  }
                }}
                title="Excluir projeto"
              >
                <Trash2 size={18} className="text-white" />
              </button>
            </div>
          )}
        </div>
      </div>

      <ProjectUsersModal
        isOpen={showUsersModal}
        projectId={project.id}
        projectTitle={project.title}
        isOwner={isOwner}
        onClose={() => setShowUsersModal(false)}
        onLeaveProject={() => {
          fetchProjects();
          navigate("/projects/");
        }}
      />
    </>
  );
};

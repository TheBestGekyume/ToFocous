import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SortTasks } from "../components/Tasks/SortTasks";
import { TaskForm } from "../components/Tasks/TaskForm";
import { TaskList } from "../components/Tasks/TaskList";
import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";
import type { TProject } from "../types/TProject";
import { ProjectItem } from "../components/Projects/ProjectItem";
import type { TProjectMember } from "../components/_Common/AssignmentControl";
import { useProjectUsers } from "../hooks/useProjectUsers";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { Modal } from "../components/_Common/Modal";
import { ProjectForm } from "../components/Projects/ProjectForm";

export const TaskPage = () => {
  const { subscribeToProjectRealtime } = useTasks();
  const { getProjectById } = useProjects();

  const { projectId } = useParams();
  const [editingProject, setEditingProject] = useState<TProject | null>(null);

  const { fetchProjectUsers } = useProjectUsers(projectId ?? "");

  const [currentProject, setCurrentProject] = useState<TProject | null>(null);
  const [projectMembers, setProjectMembers] = useState<TProjectMember[]>([]);
  const [projectLoading, setProjectLoading] = useState(true);

  const closeEditModal = () => {
    setEditingProject(null);
  };

  useEffect(() => {
    let ignore = false;

    const loadProject = async () => {
      if (!projectId) return;

      setProjectLoading(true);
      setCurrentProject(null);

      try {
        const project = await getProjectById(projectId);

        if (!ignore) {
          setCurrentProject(project);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao carregar projeto:", error);
        }
      } finally {
        if (!ignore) {
          setProjectLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      ignore = true;
    };
  }, [projectId, getProjectById]);

  useEffect(() => {
    let ignore = false;

    const loadProjectMembers = async () => {
      if (!projectId) return;

      setProjectMembers([]);

      try {
        const projectUsers = await fetchProjectUsers();

        if (ignore) return;

        const members: TProjectMember[] = projectUsers.map((projectUser) => ({
          id: projectUser.user_id,
          name: projectUser.user?.name ?? "Usuário sem nome",
        }));

        setProjectMembers(members);
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao carregar membros do projeto:", error);
        }
      }
    };

    loadProjectMembers();

    return () => {
      ignore = true;
    };
  }, [projectId, fetchProjectUsers]);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = subscribeToProjectRealtime(projectId);

    return () => {
      unsubscribe();
    };
  }, [projectId, subscribeToProjectRealtime]);

  if (projectLoading) {
    return <LoadingOverlay show />;
  }

  if (!currentProject) {
    return (
      <p className="mt-10 text-center text-zinc-500">Projeto não encontrado.</p>
    );
  }
  const projectTitle = currentProject.title.trim();
  const titleLimit = 32;
  const isTitleTruncated = projectTitle.length > titleLimit;

  const formattedProjectTitle = (() => {
    if (!isTitleTruncated) {
      return projectTitle;
    }

    const partialTitle = projectTitle.slice(0, titleLimit);
    const lastSpaceIndex = partialTitle.lastIndexOf(" ");

    return lastSpaceIndex > 0
      ? partialTitle.slice(0, lastSpaceIndex).trimEnd()
      : partialTitle.trimEnd();
  })();

  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col px-3 pb-8 sm:px-4 lg:px-0">
      <div className="py-6 sm:py-10">
        <ProjectItem
          project={currentProject}
          singleProjectItem={true}
          onEdit={setEditingProject}
        />
      </div>
      <div
        className="flex min-w-0 flex-col gap-6 rounded-xl
        border-2 border-secondary bg-background-header/50
        p-3 pb-6 sm:gap-8 sm:p-5 sm:pb-8"
      >
        <div className="w-full transition-all duration-300">
          <TaskForm />

          <hr className="my-6 border-secondary sm:my-10" />
          <div className="min-w-0 px-0 sm:px-2">
            <div
              className="flex flex-col items-start gap-2 pb-4
                sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4"
            >
              <h4 className="min-w-0 max-w-full break-words text-xl font-medium text-accent sm:text-2xl">
                <span className="text-text">Tarefas de</span>{" "}
                {formattedProjectTitle.charAt(0).toUpperCase() +
                  formattedProjectTitle.slice(1)}
                {isTitleTruncated && <span className="text-text">...</span>}
              </h4>

              <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:gap-4">
                <SortTasks />
              </div>
            </div>

            <TaskList
              projectMembers={projectMembers}
              isProjectOwner={currentProject.is_owner}
            />
          </div>
        </div>
      </div>
      <Modal
        isOpen={!!editingProject}
        onClose={closeEditModal}
        title="Editar Projeto"
        size="lg"
      >
        {editingProject && (
          <ProjectForm
            mode="edit"
            project={editingProject}
            onClose={closeEditModal}
          />
        )}
      </Modal>
    </div>
  );
};

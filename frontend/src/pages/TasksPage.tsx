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

export const TaskPage = () => {
  const { subscribeToProjectRealtime } = useTasks();
  const { getProjectById } = useProjects();

  const { projectId } = useParams();

  const { fetchProjectUsers } = useProjectUsers(projectId ?? "");

  const [currentProject, setCurrentProject] = useState<TProject | null>(null);
  const [projectMembers, setProjectMembers] = useState<TProjectMember[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadProject = async () => {
      if (!projectId) return;

      setPageLoading(true);
      setProjectMembers([]);

      try {
        const [project, projectUsers] = await Promise.all([
          getProjectById(projectId),
          fetchProjectUsers(),
        ]);

        if (ignore) return;

        const members: TProjectMember[] = projectUsers.map((projectUser) => ({
          id: projectUser.user_id,
          name: projectUser.user?.name ?? "Usuário sem nome",
        }));

        setCurrentProject(project);
        setProjectMembers(members);
      } catch (error) {
        if (!ignore) {
          console.error("Erro ao carregar projeto:", error);
        }
      } finally {
        if (!ignore) {
          setPageLoading(false);
        }
      }
    };

    loadProject();

    return () => {
      ignore = true;
    };
  }, [projectId, getProjectById, fetchProjectUsers]);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = subscribeToProjectRealtime(projectId);

    return () => {
      unsubscribe();
    };
  }, [projectId, subscribeToProjectRealtime]);

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto pb-8">
      {currentProject && (
        <div className="py-10">
          <ProjectItem project={currentProject} singleProjectItem={true} />
        </div>
      )}

      <div
        className="flex flex-col bg-background-header/50 
        border-2 border-secondary rounded-xl p-5 pb-8 gap-8"
      >
        <div className="w-full transition-all duration-300">
          <TaskForm />

          <hr className="text-zinc-700 my-10" />

          <div className="px-2">
            <div className="flex flex-wrap justify-between items-center pb-4">
              {currentProject && (
                <h4 className="text-2xl font-medium text-accent">
                  <span className="text-white">Tarefas de</span>{" "}
                  {currentProject.title[0].toUpperCase() +
                    currentProject.title.substring(1)}
                </h4>
              )}

              <div className="flex flex-wrap gap-4">
                <SortTasks />
              </div>
            </div>

            {pageLoading ? (
              <LoadingOverlay show />
            ) : (
              <TaskList
                projectMembers={projectMembers}
                isProjectOwner={currentProject?.is_owner ?? false}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
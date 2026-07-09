import { useEffect, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { TaskForm } from "../components/Tasks/TaskForm";
import { Modal } from "../components/_Common/Modal";
import { useParams } from "react-router-dom";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { LoadingLocal } from "../components/_Common/LoadingLocal";
import { SubTaskList } from "../components/SubTasks/SubTaskList";
import { TaskHeader } from "../components/SubTasks/TaskHeader";
import { useProjects } from "../hooks/useProjects";
import { useProjectUsers } from "../hooks/useProjectUsers";
import type { TProject } from "../types/TProject";
import type { TProjectMember } from "../components/_Common/AssignmentControl";
import { SortTasks } from "../components/Tasks/SortTasks";

export const SubTasksPage = () => {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();

  const {
    tasks,
    getTasksByProject,
    getSubTasks,
    getProjectAssignments,
    subscribeToProjectRealtime,
  } = useTasks();

  const { getProjectById } = useProjects();
  const { fetchProjectUsers } = useProjectUsers(projectId ?? "");

  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);
  const [subTasksLoading, setSubTasksLoading] = useState(true);

  const [notFound, setNotFound] = useState(false);
  const [currentProject, setCurrentProject] = useState<TProject | null>(null);
  const [projectMembers, setProjectMembers] = useState<TProjectMember[]>([]);

  const task = tasks.find((currentTask) => currentTask.id === taskId);

  useEffect(() => {
    if (!projectId || !taskId) {
      setPageLoading(false);
      setNotFound(true);
      return;
    }

    let isMounted = true;

    const loadBaseData = async () => {
      setPageLoading(true);
      setNotFound(false);
      setCurrentProject(null);
      setProjectMembers([]);

      try {
        const [project, projectTasks] = await Promise.all([
          getProjectById(projectId),
          getTasksByProject(projectId),
        ]);

        if (!isMounted) return;

        const taskExistsInProject = projectTasks.some(
          (projectTask) => projectTask.id === taskId
        );

        if (!taskExistsInProject) {
          setNotFound(true);
          return;
        }

        setCurrentProject(project);
      } catch (err) {
        console.error("Erro ao carregar dados da tarefa", err);

        if (isMounted) {
          setNotFound(true);
        }
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    loadBaseData();

    return () => {
      isMounted = false;
    };
  }, [projectId, taskId, getProjectById, getTasksByProject]);

  useEffect(() => {
    if (!projectId || !taskId || pageLoading || notFound) return;

    let isMounted = true;

    const loadSubTaskContent = async () => {
      setSubTasksLoading(true);

      try {
        const [projectUsers] = await Promise.all([
          fetchProjectUsers(),
          getProjectAssignments(projectId),
          getSubTasks(taskId),
        ]);

        if (!isMounted) return;

        const members: TProjectMember[] = projectUsers.map((projectUser) => ({
          id: projectUser.user_id,
          name: projectUser.user?.name ?? "Usuário sem nome",
        }));

        setProjectMembers(members);
      } catch (err) {
        console.error("Erro ao carregar conteúdo das subtarefas", err);
      } finally {
        if (isMounted) {
          setSubTasksLoading(false);
        }
      }
    };

    loadSubTaskContent();

    return () => {
      isMounted = false;
    };
  }, [
    projectId,
    taskId,
    pageLoading,
    notFound,
    fetchProjectUsers,
    getProjectAssignments,
    getSubTasks,
  ]);

  useEffect(() => {
    if (!projectId) return;

    const unsubscribe = subscribeToProjectRealtime(projectId);

    return () => {
      unsubscribe();
    };
  }, [projectId, subscribeToProjectRealtime]);

  if (pageLoading) {
    return <LoadingOverlay show />;
  }

  if (notFound || !task || !currentProject) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <p className="text-center mt-10">Tarefa não encontrada.</p>
      </div>
    );
  }

  const taskTitle = task.title.trim();
  const titleLimit = 32;
  const isTitleTruncated = taskTitle.length > titleLimit;

  const formattedTaskTitle = (() => {
    if (!isTitleTruncated) {
      return taskTitle;
    }

    const partialTitle = taskTitle.slice(0, titleLimit);
    const lastSpaceIndex = partialTitle.lastIndexOf(" ");

    return lastSpaceIndex > 0
      ? partialTitle.slice(0, lastSpaceIndex).trimEnd()
      : partialTitle.trimEnd();
  })();

  return (
    <section className="w-full min-w-0 pt-4 sm:pt-6">
      <LoadingOverlay show={loading} />

      <div
        className="
        mx-auto flex w-full max-w-5xl min-w-0 flex-col
        gap-5 px-3 pb-8
        sm:px-4
        lg:px-6
      "
      >
        <TaskHeader
          task={task}
          projectMembers={projectMembers}
          isProjectOwner={currentProject.is_owner}
        />

        <button
          type="button"
          className="
          mx-auto w-fit rounded-md bg-green-600
          px-4 py-2 font-semibold duration-300
          hover:bg-green-800
        "
          onClick={() => setIsCreatingSubTask(true)}
        >
          + SubTarefa
        </button>

        {/* <hr className="my-3 w-full border-accent/75" /> */}
        <hr className="my-6 border-primary/70 " />
        <section className=" bg-background-header/50 p-4 sm:px-8 rounded-xl border-2 border-secondary">
          <div
            className="
    flex min-w-0 flex-col items-start gap-2  my-4
    sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4
  "
          >
            <h4 className="min-w-0 max-w-full break-words text-xl font-medium text-accent sm:text-2xl">
              <span className="text-text">SubTarefas de</span>{" "}
              {formattedTaskTitle.charAt(0).toUpperCase() +
                formattedTaskTitle.slice(1)}
              {isTitleTruncated && <span className="text-text">...</span>}
            </h4>

            <div className="flex w-full min-w-0 flex-wrap gap-2 sm:w-auto sm:gap-4">
              <SortTasks />
            </div>
          </div>

          {subTasksLoading ? (
            <LoadingLocal message="Carregando subtarefas" />
          ) : (
            <SubTaskList
              task={task}
              setLoading={setLoading}
              projectMembers={projectMembers}
              isProjectOwner={currentProject.is_owner}
            />
          )}

          <Modal
            isOpen={isCreatingSubTask}
            onClose={() => setIsCreatingSubTask(false)}
            title="Criar SubTarefa"
            size="lg"
          >
            <TaskForm
              isCreatingSubTask
              parentTask={task}
              onSuccess={() => setIsCreatingSubTask(false)}
            />
          </Modal>
        </section>
      </div>
    </section>
  );
};

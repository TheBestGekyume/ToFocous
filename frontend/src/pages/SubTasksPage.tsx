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
    return <p className="text-center mt-10">Tarefa não encontrada</p>;
  }

  return (
    <section className="flex items-center flex-col w-full pt-5">
      <LoadingOverlay show={loading} />

      <div className="flex flex-col w-3/4 p-5 gap-5">
        <TaskHeader
          task={task}
          projectMembers={projectMembers}
          isProjectOwner={currentProject.is_owner}
        />

        <button
          className="px-4 py-2 mx-auto bg-green-600 hover:bg-green-800 duration-300 rounded-md w-fit font-semibold"
          onClick={() => setIsCreatingSubTask(true)}
        >
          + SubTarefa
        </button>

        <hr className="my-3 text-accent/75" />

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
      </div>
    </section>
  );
};
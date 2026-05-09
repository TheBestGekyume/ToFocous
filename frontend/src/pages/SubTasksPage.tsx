import { useEffect, useState } from "react";
import { useTasks } from "../hooks/useTasks";
import { TaskForm } from "../components/Tasks/TaskForm";
import { Modal } from "../components/Tasks/Modal";
import { priorityMap } from "../utils/taskUtils";
import { useParams } from "react-router-dom";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { SubTaskList } from "../components/SubTasks/SubTaskList";
import { TaskHeader } from "../components/SubTasks/TaskHeader";

export const SubTasksPage = () => {
  const { projectId, taskId } = useParams<{
    projectId: string;
    taskId: string;
  }>();

  const { tasks, getTasksByProject, getSubTasks } = useTasks();

  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const task = tasks.find((t) => t.id === taskId);
  const taskExists = Boolean(task);

  useEffect(() => {
    if (!projectId || !taskId) {
      setPageLoading(false);
      setNotFound(true);
      return;
    }

    let isMounted = true;

    const loadTasks = async () => {
      setPageLoading(true);
      setNotFound(false);

      try {
        const projectTasks = await getTasksByProject(projectId);

        const taskExistsInProject = projectTasks.some(
          (projectTask) => projectTask.id === taskId
        );

        if (!taskExistsInProject && isMounted) {
          setNotFound(true);
          setPageLoading(false);
        }
      } catch (err) {
        console.error("Erro ao carregar tarefas do projeto", err);

        if (isMounted) {
          setNotFound(true);
          setPageLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, [projectId, taskId, getTasksByProject]);

  useEffect(() => {
    if (!taskId || !taskExists) return;

    let isMounted = true;

    const loadSubTasks = async () => {
      try {
        await getSubTasks(taskId);
      } catch (err) {
        console.error("Erro ao carregar subtarefas", err);
      } finally {
        if (isMounted) {
          setPageLoading(false);
        }
      }
    };

    loadSubTasks();

    return () => {
      isMounted = false;
    };
  }, [taskId, taskExists, getSubTasks]);

  // useEffect(() => {
  //   console.log("task atual:", task);
  // }, [task]);

  if (pageLoading) {
    return <LoadingOverlay show />;
  }

  if (notFound || !task) {
    return <p className="text-center mt-10">Tarefa não encontrada</p>;
  }

  const currentPriority = priorityMap[task.priority];

  if (!currentPriority) return null;

  return (
    <section className="flex items-center flex-col w-full pt-5">
      <LoadingOverlay show={loading} />

      <div className="flex flex-col w-3/4 p-5 gap-5">
        <TaskHeader task={task} />

        <button
          className="px-4 py-2 mx-auto bg-green-600 hover:bg-green-800 duration-300 rounded-md w-fit font-semibold"
          onClick={() => setIsCreatingSubTask(true)}
        >
          + SubTask
        </button>

        <hr className="my-3 text-accent/75" />

        <SubTaskList task={task} setLoading={setLoading} />

        <Modal
          isOpen={isCreatingSubTask}
          onClose={() => setIsCreatingSubTask(false)}
        >
          <h4 className="font-bold mb-5 text-2xl text-center text-primary">
            Criar SubTarefa
          </h4>

          <TaskForm
            isCreating
            isCreatingSubTask
            parentTask={task}
            onClose={() => setIsCreatingSubTask(false)}
          />
        </Modal>
      </div>
    </section>
  );
};

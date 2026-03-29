import { useEffect, useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import { TaskForm } from "../components/Tasks/TaskForm";
import { Modal } from "../components/Tasks/Modal";
import { priorityMap } from "../utils/taskUtils";
import { useParams } from "react-router-dom";
import { LoadingOverlay } from "../components/_Common/LoadingOverlay";
import { SubTaskList } from "../components/SingleTaskView/SubTaskList";
import { TaskHeader } from "../components/SingleTaskView/TaskHeader";

export const SingleTaskPage = () => {
  const { tasks, getSubtTasks } = useTasks();
  const [isCreatingSubTask, setIsCreatingSubTask] = useState(false);
  const [loading, setLoading] = useState(false);
  const { taskId } = useParams();
  const task = tasks.find((t) => t.id === taskId);

  useEffect(() => {
    if (!taskId) return;
    getSubtTasks(taskId);
  }, [taskId, getSubtTasks]);

  if (!task) return <LoadingOverlay show={true} />;

  const currentPriority = priorityMap[task.priority];

  if (!currentPriority) return null;

  return (
    <section className="flex items-center flex-col w-full pt-5">
      <LoadingOverlay show={loading} />

      <div className="flex flex-col w-3/4 p-5 gap-5">
        <TaskHeader task={task} />

        <hr className="my-3 text-accent/75" />

        <SubTaskList task={task} setLoading={setLoading} />

        <button
          className="px-4 py-2 mx-auto bg-green-600 hover:bg-green-800 duration-300 rounded-md w-fit font-semibold"
          onClick={() => setIsCreatingSubTask(true)}
        >
          + SubTask
        </button>

        {/* Modal de criar subtask */}
        <Modal
          isOpen={isCreatingSubTask}
          onClose={() => setIsCreatingSubTask(false)}
        >
          <h4 className="font-bold mb-5 text-2xl text-center text-primary">
            Criar SubTarefa
          </h4>

          <TaskForm
            isCreating={true}
            isCreatingSubTask
            parentTask={task}
            onClose={() => setIsCreatingSubTask(false)}
          />
        </Modal>
      </div>
    </section>
  );
};

import { useEffect, useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import { TaskForm } from "../components/Tasks/TaskForm";
import { Modal } from "../components/Tasks/Modal";
import { priorityMap, statusMap, formatDateBR } from "../utils/taskUtils";
import { ArrowLeft, Check, Trash2 } from "lucide-react";
// import type { TSubTask } from "../../types/TTask";
import { taskService } from "../services/taskService";
import { useParams, useNavigate } from "react-router-dom";
import { TaskItem } from "../components/Tasks/TaskItem";

export const SingleTaskPage = () => {
  const { selectedTask, setSelectedTask, setTasks } = useTasks();
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const { taskId } = useParams();
  const navigate = useNavigate();

  const { toggleSubtaskStatus, deleteSubtask } = useTasks();
  useEffect(() => {
    const loadSubtasks = async () => {
      if (
        !selectedTask ||
        selectedTask.id !== taskId ||
        selectedTask.subtasks?.length
      )
        return;

      try {
        const subtasks = await taskService.getSubtasks(selectedTask.id);

        setTasks((prev) =>
          prev.map((t) => (t.id === selectedTask.id ? { ...t, subtasks } : t))
        );

        setSelectedTask((prev) => (prev ? { ...prev, subtasks } : prev));
      } catch (err) {
        console.error("Erro ao carregar subtasks", err);
      }
    };

    loadSubtasks();
  }, [selectedTask, selectedTask?.id, setSelectedTask, setTasks]);

  if (!selectedTask) return null;

  const currentPriority = priorityMap[selectedTask.priority];

  if (!currentPriority) return null;

  return (
    <section className="flex items-center flex-col w-full pt-5">
      <div className="flex flex-col w-3/4 p-5 gap-5">
        <div className="flex flex-col md:flex-row">
          <button
            className="p-2 bg-zinc-700/75 hover:bg-zinc-800/75 duration-300 w-fit rounded-full h-fit"
            onClick={() => {
              setSelectedTask(null);
              navigate("/tarefas");
            }}
          >
            <ArrowLeft size={24} />
          </button>

          <section className="mx-auto w-full px-15">
            <TaskItem
              key={selectedTask.id}
              task={selectedTask}
              setTasks={setTasks}
            />
          </section>
        </div>

        <hr className="my-3 text-accent/75" />

        {selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
          <section className="flex flex-col gap-2">
            {selectedTask.subtasks.map((subtask) => {
              const isDone = subtask.status === "concluded";
              const statusInfo = statusMap[subtask.status];

              return (
                <div
                  key={subtask.id}
                  className="flex items-center gap-5 p-2 bg-zinc-800 border border-zinc-600 rounded-md"
                >
                  <button
                    onClick={() =>
                      toggleSubtaskStatus(selectedTask.id, subtask.id)
                    }
                    className={`
    w-6 h-6 flex items-center justify-center rounded-md border
    transition-all duration-300 cursor-pointer
    ${
      isDone
        ? "bg-purple-700 border-purple-700"
        : "bg-zinc-900 border-zinc-600 hover:border-zinc-400"
    }
  `}
                  >
                    {isDone && <Check size={24} className="text-white" />}
                  </button>

                  <div className="flex flex-1 flex-col">
                    <h4
                      className={`font-semibold ${
                        isDone ? "line-through text-zinc-400" : ""
                      }`}
                    >
                      {subtask.title}
                    </h4>

                    <p className={isDone ? "line-through text-zinc-500" : ""}>
                      {subtask.description}
                    </p>

                    <p className="text-sm text-zinc-400">
                      {formatDateBR(subtask.due_date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between gap-5">
                    <div
                      className={`flex ms-auto items-center gap-2 w-fit px-2 py-1 
                        rounded-md text-sm ${statusInfo.bg}`}
                    >
                      {statusInfo.icon}
                      <span className={statusInfo.color}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <button
                      className="p-2 bg-red-600 hover:bg-red-800 rounded-full duration-300"
                      onClick={() => deleteSubtask(selectedTask.id, subtask.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </section>
        )}

        <button
          className="px-4 py-2 mx-auto bg-green-600 hover:bg-green-800 duration-300 rounded-md w-fit font-semibold"
          onClick={() => setIsCreatingSubtask(true)}
        >
          + SubTask
        </button>

        {/* Modal de criar subtask */}
        <Modal
          isOpen={isCreatingSubtask}
          onClose={() => setIsCreatingSubtask(false)}
        >
          <h4 className="font-bold mb-5 text-2xl text-center text-primary">
            Criar Item
          </h4>

          <TaskForm
            isCreating={true}
            isCreatingSubtask
            taskToEdit={selectedTask}
            setTasks={setTasks}
            setSelectedTask={setSelectedTask}
            onClose={() => setIsCreatingSubtask(false)}
          />
        </Modal>
      </div>
    </section>
  );
};

import { useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import { Form } from "./Form";
import { Modal } from "./Modal";
import { priorityMap, statusMap } from "../utils/taskUtils";
import { ArrowLeft, Check, Pencil, Trash2 } from "lucide-react";
import type { TSubTask } from "../types/TTask";

export const TaskDetails = () => {
  const { selectedTask, setSelectedTask, setTasks } = useTasks();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);
  const [editingSubtask, setEditingSubtask] = useState<TSubTask | null>(null);

  const { toggleSubtask, deleteSubtask } = useTasks();

  if (!selectedTask) return null;

  const currentPriority = priorityMap[selectedTask.priority];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row">
        <button
          className="p-2 bg-zinc-700/75 hover:bg-zinc-800/75 duration-300 w-fit rounded-full h-fit"
          onClick={() => setSelectedTask(null)}
        >
          <ArrowLeft size={24} />
        </button>

        <section
          className={`flex flex-col w-100 gap-4 p-4 mt-4 md:mt-0 bg-accent/25 rounded-md border mx-auto ${currentPriority.border}`}
        >
          <div className="flex flex-col gap-2 lg:flex-row items-baseline justify-between">
            <h3 className="font-semibold text-xl">{selectedTask.title}</h3>

            <p className="text-sm text-zinc-300 bg-zinc-950 px-2 rounded-sm">
              {new Date(selectedTask.date).toLocaleDateString("pt-BR", {
                timeZone: "UTC",
              })}
            </p>
          </div>

          <div className="flex gap-4 items-end justify-between">
            <p className="text-zinc-300 w-4/5">{selectedTask.description}</p>

            <button
              className="p-2 bg-yellow-600 hover:bg-yellow-800 duration-300 rounded-full"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil size={18} />
            </button>
          </div>
        </section>
      </div>

      <hr className="my-3 text-accent/75" />

      {selectedTask.subtasks.length > 0 && (
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
                  onClick={() => toggleSubtask(selectedTask.id, subtask.id)}
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
                    {new Date(subtask.date).toLocaleDateString("pt-BR", {
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end justify-between gap-5">
                  {isDone ? (
                    <button
                      className="p-2 bg-red-600 hover:bg-red-800 rounded-full duration-300"
                      onClick={() => deleteSubtask(selectedTask.id, subtask.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  ) : (
                    <button
                      className="p-2 bg-yellow-600 hover:bg-yellow-800 duration-300 rounded-full w-fit"
                      onClick={() => {
                        setEditingSubtask(subtask);
                        setIsEditOpen(true);
                      }}
                    >
                      <Pencil size={18} />
                    </button>
                  )}

                  <div
                    className={`flex ms-auto items-center gap-2 w-fit px-2 py-1 rounded-md text-sm ${statusInfo.bg}`}
                  >
                    {statusInfo.icon}
                    <span className={statusInfo.color}>{statusInfo.label}</span>
                  </div>
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

      {/* Modal de editar */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingSubtask(null);
        }}
      >
        <Form
          isCreating={false}
          isCreatingSubtask={!!editingSubtask}
          taskToEdit={editingSubtask ?? selectedTask}
          parentTask={editingSubtask ? selectedTask : undefined}
          setTasks={setTasks}
          setSelectedTask={setSelectedTask}
          onClose={() => {
            setIsEditOpen(false);
            setEditingSubtask(null);
          }}
        />
      </Modal>

      {/* Modal de subtask */}
      <Modal
        isOpen={isCreatingSubtask}
        onClose={() => setIsCreatingSubtask(false)}
      >
        <Form
          isCreating={true}
          isCreatingSubtask
          taskToEdit={selectedTask}
          setTasks={setTasks}
          setSelectedTask={setSelectedTask}
          onClose={() => setIsCreatingSubtask(false)}
        />
      </Modal>
    </div>
  );
};

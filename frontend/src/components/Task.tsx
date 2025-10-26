import { useState } from "react";
import { Modal } from "./Modal";
import { Form } from "./Form";
import type { TTask } from "../types/TTask";
import { Pencil } from "lucide-react";
import { priorityMap, statusMap, getTimeMessage } from "../utils/taskUtils";

type TaskProps = {
  task: TTask;
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const Task = ({ task, setTasks }: TaskProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { title, date, priority, status } = task;

  const currentPriority = priorityMap[priority];
  const currentStatus = statusMap[status];
  const { msg: timeMessage, color: timeColor } = getTimeMessage(new Date(date));

  return (
    <>
      <div
        className={`flex justify-between items-center p-3 border-2 ${currentPriority.border}
          rounded-lg bg-zinc-800 hover:bg-zinc-900 duration-150`}
      >
        <div>
          {/* Título e data */}
          <div className="flex gap-3 items-center">
            <h3
              className={`font-semibold text-white ${
                status === "concluded" ? "line-through text-zinc-400" : ""
              }`}
            >
              {title}
            </h3>

            {status !== "concluded" && (
              <p className="text-sm text-zinc-400 bg-zinc-950 px-2 rounded-sm">
                {new Date(date).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>

          {status !== "concluded" && (
            <p className={`text-xs mt-1 ${timeColor}`}>{timeMessage}</p>
          )}
        </div>

        <div className="flex items-center gap-5">
          <div className="flex flex-col items-end text-sm">
            <div className={`font-semibold ${currentPriority.color} p-1`}>
              Prioridade: {currentPriority.label}
            </div>
            <div
              className={`flex items-center gap-1 ${currentStatus.bg} rounded-sm p-1`}
            >
              {currentStatus.icon}
              <span className={currentStatus.color}>{currentStatus.label}</span>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1 rounded-full cursor-pointer
              bg-yellow-500 hover:bg-yellow-300
              border-2 border-transparent hover:border-white
              duration-300"
          >
            <Pencil className="size-4" />
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h4 className="font-bold mb-4 text-xl">Editar Tarefa</h4>
        <Form
          isCreating={false}
          taskToEdit={task}
          setTasks={setTasks}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </>
  );
};

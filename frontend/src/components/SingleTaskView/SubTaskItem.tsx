import { Check, Trash2 } from "lucide-react";
import { useTasks } from "../../contexts/TasksContext";
import { formatDateBR } from "../../utils/taskUtils";

import type { TSubTask } from "../../types/TTask";

type SubtaskItemProps = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubtaskItem = ({ subtask, taskId, setLoading}: SubtaskItemProps) => {

  const { toggleSubtaskStatus, deleteSubtask } = useTasks();

  const isDone = subtask.status === "concluded";
  //   const statusInfo = statusMap[subtask.status];

  return (
    <div className="flex items-center gap-5 p-2 bg-zinc-800 border border-zinc-600 rounded-md">
      <button
        onClick={() => toggleSubtaskStatus(taskId, subtask.id)}
        className={`
          w-6 h-6 flex items-center justify-center rounded-md border
          transition-all duration-300
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
          className={`font-semibold ${isDone ? "line-through text-zinc-400" : ""}`}
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

      <button
        className="p-2 bg-red-600 hover:bg-red-800 rounded-full"
        onClick={async () => {
          setLoading(true);
          await deleteSubtask(taskId, subtask.id);
          setLoading(false);
        }}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

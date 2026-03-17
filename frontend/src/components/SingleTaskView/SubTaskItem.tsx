import { Check, Trash2 } from "lucide-react";
import { useTasks } from "../../contexts/TasksContext";
// import { formatDateBR } from "../../utils/taskUtils";
import { useEffect, useState } from "react";

import type { TSubTask } from "../../types/TTask";

type SubtaskItemProps = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubtaskItem = ({ subtask, taskId, setLoading }: SubtaskItemProps) => {
  const { toggleSubtaskStatus, deleteSubtask, updateSubtask } = useTasks();

  const [localSubtask, setLocalSubtask] = useState(subtask);

  const isDone = localSubtask.status === "concluded";

  useEffect(() => {
    setLocalSubtask(subtask);
  }, [subtask]);

  const handleChange = <K extends keyof TSubTask>(field: K, value: TSubTask[K]) => {
    setLocalSubtask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = async () => {
    if (!localSubtask.title.trim() || !localSubtask.due_date) {
      setLocalSubtask(subtask);
      return;
    }

    if (JSON.stringify(localSubtask) === JSON.stringify(subtask)) return;

    await updateSubtask(taskId, subtask.id, localSubtask);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }

    if (e.key === "Escape") {
      setLocalSubtask(subtask);
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }
  };

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

      <div className="flex flex-1 flex-col gap-1">

        <input
          value={localSubtask.title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`bg-transparent outline-none border border-transparent
            focus:bg-zinc-700 focus:border-white rounded-md p-1
            ${isDone ? "line-through text-zinc-400" : ""}
          `}
        />

        <textarea
          value={localSubtask.description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`bg-transparent resize-none outline-none border border-transparent
            focus:bg-zinc-700 focus:border-white rounded-md p-1
            ${isDone ? "line-through text-zinc-500" : ""}
          `}
        />

        <input
          type="date"
          value={localSubtask.due_date}
          onChange={(e) => handleChange("due_date", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-sm text-zinc-400 outline-none"
        />

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
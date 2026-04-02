import {
  AlarmClockCheck,
  AlarmClockPlus,
  Check,
  Play,
  Trash2,
} from "lucide-react";
import { useTasks } from "../../contexts/TasksContext";
import { useEffect, useState } from "react";
import type { TSubTask } from "../../types/TTask";
import { useTaskSettings } from "../../hooks/useTaskSettings";
import { DatePicker } from "../_Common/DatePicker";
import { TimeInput } from "../_Common/TimeInput";

type SubTaskItemProps = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubTaskItem = ({
  subtask,
  taskId,
  setLoading,
}: SubTaskItemProps) => {
  const { deleteSubTask, updateSubTask } = useTasks();
  const { settings } = useTaskSettings();

  const [localSubTask, setLocalSubTask] = useState(subtask);

  useEffect(() => {
    setLocalSubTask(subtask);
  }, [subtask]);

  if (!settings) return null;

  const isDone = localSubTask.status === "concluded";

  const showStartDate = settings.use_start_date;
  const showTime = settings.use_time;
  const showStartTime = settings.use_time && settings.use_start_date;

  // 🔥 commit centralizado
  const commitUpdate = async (updated: TSubTask) => {
    try {
      setLoading(true);
      await updateSubTask(taskId, subtask.id, updated);
    } finally {
      setLoading(false);
    }
  };

  const handleImmediateChange = <K extends keyof TSubTask>(
    field: K,
    value: TSubTask[K]
  ) => {
    const updated = {
      ...localSubTask,
      [field]: value,
    };

    setLocalSubTask(updated);
    commitUpdate(updated);
  };

  const handleChange = <K extends keyof TSubTask>(
    field: K,
    value: TSubTask[K]
  ) => {
    setLocalSubTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 🔥 inputs de texto
  const handleBlur = async () => {
    if (!localSubTask.title.trim() || !localSubTask.due_date) {
      setLocalSubTask(subtask);
      return;
    }

    await commitUpdate(localSubTask);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }

    if (e.key === "Escape") {
      setLocalSubTask(subtask);
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }
  };

  // 🔥 toggle com persistência (corrigido)
  const toggleStatus = () => {
    const updated: TSubTask = {
      ...localSubTask,
      status: localSubTask.status === "concluded" ? "unstarted" : "concluded",
    };

    setLocalSubTask(updated);
    commitUpdate(updated);
  };

  return (
    <div className="flex items-center gap-5 p-3 bg-zinc-800 border border-zinc-600 rounded-md">
      {/* Status */}
      <button
        onClick={toggleStatus}
        className={`
          w-6 h-6 flex items-center justify-center rounded-md border
          transition-all duration-300 mt-1
          ${
            isDone
              ? "bg-purple-700 border-purple-700"
              : "bg-zinc-900 border-zinc-600 hover:border-zinc-400"
          }
        `}
      >
        {isDone && <Check size={16} className="text-white" />}
      </button>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-2">
        <input
          value={localSubTask.title}
          onChange={(e) => handleChange("title", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Título da subtarefa"
          className={`outline-none border border-transparent
          duration-100 hover:bg-zinc-700 focus:bg-zinc-900
          focus:border-accent rounded-md p-1
          ${isDone ? "line-through text-zinc-400" : ""}
          `}
        />

        <textarea
          value={localSubTask.description}
          onChange={(e) => handleChange("description", e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          placeholder="Descrição"
          className={`resize-none outline-none border border-transparent duration-100
          hover:bg-zinc-700 focus:bg-zinc-900 focus:border-accent rounded-md p-1
          ${isDone ? "line-through text-zinc-500" : ""}
          `}
        />

        {/* Datas */}
        {!isDone && (
          <div className="flex items-end flex-wrap gap-3">
            {showStartDate && (
              <DatePicker
                value={localSubTask.start_date}
                onChange={(date) =>
                  handleImmediateChange("start_date", date || "")
                }
                title="Data de início"
                icon={Play}
              />
            )}

            <DatePicker
              value={localSubTask.due_date}
              onChange={(date) => handleImmediateChange("due_date", date || "")}
              title="Data de prazo"
              icon={Check}
            />

            {(showTime || showStartTime) && (
              <>
                {showStartTime && (
                  <TimeInput
                    value={localSubTask.start_time}
                    onChange={(time) =>
                      handleImmediateChange("start_time", time || "")
                    }
                    title="Hora de início"
                    icon={AlarmClockPlus}
                  />
                )}

                {showTime && (
                  <TimeInput
                    value={localSubTask.due_time}
                    onChange={(time) =>
                      handleImmediateChange("due_time", time || "")
                    }
                    title="Hora de prazo"
                    icon={AlarmClockCheck}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>

      <button
        className="p-2 bg-red-600 hover:bg-red-800 rounded-full"
        onClick={async () => {
          try {
            setLoading(true);
            await deleteSubTask(taskId, subtask.id);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

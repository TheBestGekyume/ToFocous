import { Check, Play, Trash2 } from "lucide-react";
import { useTasks } from "../../contexts/TasksContext";
import { useEffect, useState } from "react";
import type { TSubTask } from "../../types/TTask";
import { useTaskSettings } from "../../hooks/useTaskSettings";
import { DatePicker } from "../_Common/DatePicker";

type SubtaskItemProps = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubtaskItem = ({
  subtask,
  taskId,
  setLoading,
}: SubtaskItemProps) => {
  const { toggleSubtaskStatus, deleteSubtask, updateSubtask } = useTasks();
  const { settings } = useTaskSettings();

  const [localSubtask, setLocalSubtask] = useState(subtask);

  useEffect(() => {
    setLocalSubtask(subtask);
  }, [subtask]);

  if (!settings) return null;

  const isDone = localSubtask.status === "concluded";

  const showStartDate = settings.use_start_date;
  const showTime = settings.use_time;
  const showStartTime = settings.use_time && settings.use_start_date;

  const handleChange = <K extends keyof TSubTask>(
    field: K,
    value: TSubTask[K]
  ) => {
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

    const hasChanged =
      localSubtask.title !== subtask.title ||
      localSubtask.description !== subtask.description ||
      localSubtask.due_date !== subtask.due_date ||
      localSubtask.start_date !== subtask.start_date ||
      localSubtask.due_time !== subtask.due_time ||
      localSubtask.start_time !== subtask.start_time ||
      localSubtask.priority !== subtask.priority ||
      localSubtask.status !== subtask.status;

    if (!hasChanged) return;

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
    <div className="flex items-center gap-5 p-3 bg-zinc-800 border border-zinc-600 rounded-md h-fitr">
      {/* Status */}
      <button
        onClick={() => toggleSubtaskStatus(taskId, subtask.id)}
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
          value={localSubtask.title}
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
          value={localSubtask.description}
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
                value={localSubtask.start_date}
                onChange={(date) => handleChange("start_date", date || "")}
                title="Data de início"
                icon={Play}
              />
            )}

            <DatePicker
              value={localSubtask.due_date}
              onChange={(date) => handleChange("due_date", date || "")}
              title="Data de prazo"
              icon={Check}
            />

            {(showTime || showStartTime) && (
              <div className=" ps-4 flex gap-6 text-xs">
                {showStartTime && (
                  <div className="flex flex-col">
                    <span>Hora início</span>
                    <input
                      type="time"
                      step={60}
                      value={localSubtask.start_time || ""}
                      onChange={(e) =>
                        handleChange("start_time", e.target.value)
                      }
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      className="text-sm py-1 outline-none border-b
                  focus:bg-zinc-900 focus:border-accent
                  hover:bg-zinc-700 duration-100"
                    />
                  </div>
                )}

                {showTime && (
                  <div className="flex flex-col">
                    <span>Hora prazo</span>
                    <input
                      type="time"
                      step={60}
                      value={localSubtask.due_time || ""}
                      onChange={(e) => handleChange("due_time", e.target.value)}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                      className="text-sm py-1 outline-none border-b
                  focus:bg-zinc-900 focus:border-accent
                  hover:bg-zinc-700 duration-100"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        className=" p-2 bg-red-600 hover:bg-red-800 rounded-full"
        onClick={async () => {
          try {
            setLoading(true);
            await deleteSubtask(taskId, subtask.id);
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

import {
  AlarmClockCheck,
  AlarmClockPlus,
  Check,
  Play,
  Trash2,
} from "lucide-react";
import { DatePicker } from "../_Common/DatePicker";
import { TimeInput } from "../_Common/TimeInput";
import { useSubTaskItem } from "../../hooks/useSubTaskItem";
import type { TSubTask } from "../../types/TTask";

type Props = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubTaskItem = ({ subtask, taskId, setLoading }: Props) => {
  const {
    localData,
    isDone,
    showStartDate,
    showTime,
    showStartTime,
    handleChange,
    handleBlur,
    handleKeyDown,
    handleImmediateChange,
    toggleStatus,
    handleDelete,
  } = useSubTaskItem({ subtask, taskId, setLoading });

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

      <div className="flex flex-1 flex-col gap-2">
        <input
          value={localData.title}
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
          value={localData.description}
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

        {!isDone && (
          <div className="flex items-end flex-wrap gap-3">
            {showStartDate && (
              <DatePicker
                value={localData.start_date}
                onChange={(date) =>
                  handleImmediateChange("start_date", date || "")
                }
                title="Data de início"
                icon={Play}
              />
            )}

            <DatePicker
              value={localData.due_date}
              onChange={(date) =>
                handleImmediateChange("due_date", date || "")
              }
              title="Data de prazo"
              icon={Check}
            />

            {showStartTime && (
              <TimeInput
                value={localData.start_time}
                onChange={(time) =>
                  handleImmediateChange("start_time", time || "")
                }
                title="Hora de início"
                icon={AlarmClockPlus}
              />
            )}

            {showTime && (
              <TimeInput
                value={localData.due_time}
                onChange={(time) =>
                  handleImmediateChange("due_time", time || "")
                }
                title="Hora de prazo"
                icon={AlarmClockCheck}
              />
            )}
          </div>
        )}
      </div>

      <button
        className="p-2 bg-red-600 hover:bg-red-800 rounded-full"
        onClick={handleDelete}
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};
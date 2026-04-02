import type { TTask } from "../../types/TTask";
import { useTasks } from "../../hooks/useTask";
import {
  AlarmClockCheck,
  AlarmClockPlus,
  Check,
  Eye,
  Play,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { Dropdown } from "./Dropdown";
import { useNavigate, useParams } from "react-router-dom";
import {
  priorityMap,
  statusMap,
  getTimeMessage,
  statusOptions,
  priorityOptions,
} from "../../utils/taskUtils";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import { useTaskSettings } from "../../hooks/useTaskSettings";
import { DatePicker } from "../_Common/DatePicker";
import { TimeInput } from "../_Common/TimeInput";

type TaskProps = {
  task: TTask;
};

export const TaskItem = ({ task }: TaskProps) => {
  const [localTask, setLocalTask] = useState(task);
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId?: string }>();
  const isDetailsPage = !!taskId;

  const { updateTask, deleteTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const { settings } = useTaskSettings();

  const commitUpdate = async (updatedTask: TTask) => {
    try {
      setLoading(true);
      await updateTask(task.id, updatedTask);
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return <LoadingOverlay show />;
  }

  const showStartDate = settings.use_start_date;
  const showTime = settings.use_time;
  const showStartTime = settings.use_time && settings.use_start_date;

  const changeStatus = (status: TTask["status"]) =>
    handleImmediateChange("status", status);

  const changePriority = (priority: TTask["priority"]) =>
    handleImmediateChange("priority", priority);

  const handleImmediateChange = <K extends keyof TTask>(
    field: K,
    value: TTask[K]
  ) => {
    const updated = {
      ...localTask,
      [field]: value,
    };

    setLocalTask(updated);
    commitUpdate(updated);
  };

  const handleChange = <K extends keyof TTask>(field: K, value: TTask[K]) => {
    setLocalTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = async () => {
    if (!localTask.title.trim() || !localTask.due_date) {
      setLocalTask(task);
      return;
    }

    await commitUpdate(localTask);
  };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }

    if (e.key === "Escape") {
      setLocalTask(task);
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }
  };

  const handleDeleteTask = async () => {
    const deleteConfirm = window.confirm(
      `Quer mesmo deletar a tarefa "${localTask.title}"?`
    );
    if (!deleteConfirm) return;
    await deleteTask(localTask.id);
  };

  const { msg: timeMessage, color: timeColor } = getTimeMessage(
    new Date(localTask.due_date)
  );

  const currentPriority = priorityMap[localTask.priority];
  const currentStatus = statusMap[localTask.status];

  return (
    <>
      <LoadingOverlay show={loading} />

      <div
        className={`flex justify-between items-center p-3 border-2
          ${currentPriority.border} rounded-lg bg-zinc-800`}
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 flex-wrap">
            {showStartDate && localTask.status !== "concluded" && (
              <DatePicker
                value={localTask.start_date}
                onChange={(date) =>
                  handleImmediateChange("start_date", date || "")
                }
                icon={Play}
                title="Data de Início"
              />
            )}

            {localTask.status !== "concluded" && (
              <DatePicker
                value={localTask.due_date}
                onChange={(date) =>
                  handleImmediateChange("due_date", date || "")
                }
                icon={Check}
                title="Data de Prazo"
              />
            )}

            {showStartTime && localTask.status !== "concluded" && (
              <TimeInput
                value={localTask.start_time}
                onChange={(time) =>
                  handleImmediateChange("start_time", time || "")
                }
                title="Hora de início"
                icon={AlarmClockPlus}
              />
            )}

            {showTime && localTask.status !== "concluded" && (
              <TimeInput
                value={localTask.due_time}
                onChange={(time) =>
                  handleImmediateChange("due_time", time || "")
                }
                title="Hora de prazo"
                icon={AlarmClockCheck}
              />
            )}
          </div>

          <input
            name="title"
            required
            value={localTask.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Insira o Título"
            className={`text-xl font-semibold outline-none border border-transparent
              duration-100 focus:bg-zinc-900 focus:border-accent
              hover:bg-zinc-700 rounded-md p-1 
              ${localTask.status === "concluded" ? "line-through text-zinc-400" : ""}
              ${isDetailsPage ? "w-full" : "w-max"}`}
          />

          <textarea
            value={localTask.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="outline-none resize-none rounded-sm border text-text
              border-transparent px-1 m-0 duration-100 focus:bg-zinc-900 focus:border-accent 
              focus:resize-y hover:bg-zinc-700 hover:resize-y w-9/10"
          />

          {localTask.status !== "concluded" && (
            <p className={`px-1 text-xs ${timeColor}`}>{timeMessage}</p>
          )}
        </div>

        <div className="flex flex-col items-end justify-center gap-4 text-sm">
          <div className="flex gap-4 w-max">
            <Dropdown
              value={localTask.priority}
              options={priorityOptions}
              onChange={changePriority}
              buttonClass={`font-bold px-2 py-1 focus:bg-zinc-900 hover:bg-zinc-700 rounded-sm duration-100
                ${currentPriority.color}`}
              renderLabel={(value) => `Prioridade: ${priorityMap[value].label}`}
            />

            {!isDetailsPage && (
              <button
                onClick={() => navigate(`/tarefa/${task.id}`)}
                className="bg-indigo-600 hover:bg-indigo-800 duration-150 p-2 rounded-full"
              >
                <Eye size={20} />
              </button>
            )}
          </div>

          <div
            className={`flex ${
              isDetailsPage ? "flex-col" : "flex-row"
            } items-end gap-4`}
          >
            <Dropdown
              value={localTask.status}
              options={statusOptions}
              onChange={changeStatus}
              buttonClass={`flex items-center gap-2 rounded-sm px-2 py-1 duration-100 border
                border-transparent hover:bg-zinc-950 focus:bg-zinc-900 focus:border-accent
                ${currentStatus.bg} ${currentStatus.color}`}
            />

            <button
              onClick={async () => {
                try {
                  setLoading(true);
                  await handleDeleteTask();
                } finally {
                  setLoading(false);
                }
              }}
              className="bg-red-600 hover:bg-red-800 duration-150 p-2 rounded-full"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

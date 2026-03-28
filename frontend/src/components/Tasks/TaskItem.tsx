import type { TTask } from "../../types/TTask";
import { useTasks } from "../../contexts/TasksContext";
import { Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown } from "./Dropdown";
import { useNavigate } from "react-router-dom";
import {
  priorityMap,
  statusMap,
  getTimeMessage,
  statusOptions,
  priorityOptions,
} from "../../utils/taskUtils";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import { useTaskSettings } from "../../hooks/useTaskSettings";

type TaskProps = {
  task: TTask;
  // setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const TaskItem = ({ task /*, setTasks*/ }: TaskProps) => {
  const [localTask, setLocalTask] = useState(task);
  const navigate = useNavigate();
  const { selectedTask, setSelectedTask, updateTask, deleteTask } = useTasks();
  const [loading, setLoading] = useState(false);
  const { settings } = useTaskSettings();

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  if (!settings) {
    return <LoadingOverlay show />;
  }

  const showStartDate = settings.use_start_date;
  const showTime = settings.use_time;
  const showStartTime = settings.use_time && settings.use_start_date;

  const changeStatus = async (status: TTask["status"]) => {
    const updated = { ...localTask, status };
    setLocalTask(updated);
    await updateTask(task.id, updated);
  };

  const changePriority = async (priority: TTask["priority"]) => {
    const updated = { ...localTask, priority };
    setLocalTask(updated);
    await updateTask(task.id, updated);
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

    if (JSON.stringify(localTask) === JSON.stringify(task)) return;

    await updateTask(task.id, localTask);
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
      `Queer mesmo deletar a tarefa "${localTask.title}"`
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
        <div className="flex flex-col gap-4 w-2/3">
          <div
            className={`flex flex-wrap gap-4 items-baseline ${selectedTask ? "flex-col-reverse" : "flex-row"}`}
          >
            <input
              name="title"
              required
              value={localTask.title}
              onChange={(e) => handleChange("title", e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={"Insira o Título"}
              className={`font-semibold outline-none border border-transparent
              duration-100 focus:bg-zinc-900 focus:border-accent
            hover:bg-zinc-700 rounded-md p-1 
            ${localTask.status === "concluded" ? "line-through text-zinc-400" : ""}
            ${selectedTask ? "w-full" : "w-max"}`}
            />

            {showStartDate && localTask.status !== "concluded" && (
              <div className="flex flex-col text-xs text-zinc-400">
                <input
                  name="start_date"
                  type="date"
                  value={localTask.start_date || ""}
                  onChange={(e) => handleChange("start_date", e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="text-sm text-zinc-300 px-2 py-1 rounded-sm outline-none
                focus:bg-zinc-900 focus:border-accent
                hover:bg-zinc-700 border duration-100"
                />
                <span>Início</span>
              </div>
            )}

            {localTask.status !== "concluded" && (
              <div className="flex flex-col text-xs text-zinc-400">
                <input
                  name="due_date"
                  type="date"
                  value={localTask.due_date}
                  onChange={(e) => handleChange("due_date", e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="text-sm text-zinc-300 px-2 py-1 rounded-sm outline-none
                focus:bg-zinc-900 focus:border-accent
                hover:bg-zinc-700 border duration-100"
                />
                <span>Prazo</span>
              </div>
            )}
          </div>

          <textarea
            value={localTask.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="w-full bg-transparent outline-none resize-none 
              duration-100 focus:bg-zinc-900 focus:border-accent text-zinc-300
              hover:bg-zinc-700 rounded-sm border border-transparent p-0 m-0"
          />

          <div className="flex w-full gap-4">
            {showStartTime && localTask.status !== "concluded" && (
              <div className="flex flex-col text-xs text-zinc-400">
                <span>Hora de início</span>
                <input
                  type="time"
                  value={localTask.start_time || ""}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="text-sm text-zinc-300 px-2 py-1 rounded-sm outline-none
                 focus:bg-zinc-900 focus:border-accent
                 hover:bg-zinc-700 border duration-100"
                />
              </div>
            )}

            {showTime && localTask.status !== "concluded" && (
              <div className="flex flex-col text-xs text-zinc-400">
                <span>Hora do prazo</span>
                <input
                  type="time"
                  value={localTask.due_time || ""}
                  onChange={(e) => handleChange("due_time", e.target.value)}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  className="text-sm text-zinc-300 px-2 py-1 rounded-sm outline-none
                focus:bg-zinc-900 focus:border-accent
                hover:bg-zinc-700 border duration-100"
                />
              </div>
            )}
          </div>
          {localTask.status !== "concluded" && (
            <p className={`text-xs ${timeColor}`}>{timeMessage}</p>
          )}
        </div>

        <div className="flex flex-col items-end justify-center gap-4 text-sm">
          {/* {!selectedTask && ( */}
          <div className="flex gap-4 w-max">
            <Dropdown
              value={localTask.priority}
              options={priorityOptions}
              onChange={changePriority}
              buttonClass={`font-bold px-2 py-1 focus:bg-zinc-900 hover:bg-zinc-700 rounded-sm duration-100
                ${currentPriority.color}`}
              renderLabel={(value) => `Prioridade: ${priorityMap[value].label}`}
            />
            {!selectedTask && (
              <button
                onClick={() => {
                  setSelectedTask(task);
                  navigate(`/tarefa/${task.id}`);
                }}
                className="bg-indigo-600 hover:bg-indigo-800 duration-150 p-2 rounded-full"
              >
                <Eye size={20} />
              </button>
            )}
          </div>
          {/* )} */}

          <div
            className={`flex ${selectedTask ? "flex-col" : "flex-row"} items-end gap-4`}
          >
            <Dropdown
              value={localTask.status}
              options={statusOptions}
              onChange={changeStatus}
              buttonClass={`flex items-center gap-2 rounded-sm px-2 py-1 duration-100 border
                border-transparent hover:bg-zinc-950 focus:bg-zinc-900 focus:border-accent
                ${currentStatus.bg} ${currentStatus.color} `}
            />

            <button
              onClick={async () => {
                setLoading(true);
                await handleDeleteTask();
                setLoading(false);
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

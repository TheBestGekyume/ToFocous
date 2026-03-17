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

type TaskProps = {
  task: TTask;
  // setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const TaskItem = ({ task /*, setTasks*/ }: TaskProps) => {
  const { selectedTask, setSelectedTask } = useTasks();
  const [localTask, setLocalTask] = useState(task);
  const navigate = useNavigate();
  const { updateTask } = useTasks();
  const { deleteTask } = useTasks();
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setLocalTask(task);
  }, [task]);

  return (
    <>
      <LoadingOverlay show={loading} />
      <div
        className={`flex justify-between items-center p-3 border-2
            ${currentPriority.border} rounded-lg bg-zinc-800`}
      >
        <div className="flex flex-col gap-5 w-2/3">
          <div className="flex gap-4 flex-col lg:flex-row items-baseline">
            <input
              name="title"
              required
              value={
                localTask.title.length > 60
                  ? `${localTask.title.substring(0, 60)}...`
                  : localTask.title
              }
              onChange={(e) => handleChange("title", e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={"Insira o Titulo"}
              className={`font-semibold outline-none border border-transparent
                duration-100 focus:bg-zinc-900 focus:border-accent 
                hover:bg-zinc-700  rounded-md p-1 
                ${localTask.status === "concluded" ? "line-through text-zinc-400" : ""}`}
            />

            {localTask.status !== "concluded" && (
              <input
                name="due_date"
                required
                type="date"
                value={localTask.due_date}
                onChange={(e) => handleChange("due_date", e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="hide-date-icon appearance-none text-md text-zinc-300
                 px-2 py-1 rounded-sm outline-none focus:bg-zinc-900
                focus:border-accent focus:text-zinc-300 hover:bg-zinc-700 
                hover:text-zinc-300 border duration-100"
              />
            )}
          </div>

          <h4 className="text-zinc-400 w-full">
            <textarea
              value={localTask.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none resize-none 
              duration-100 focus:bg-zinc-900 focus:border-accent 
              hover:bg-zinc-700 rounded-sm border border-transparent"
            />
          </h4>

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

import type { TTask } from "../../types/TTask";
import { useTasks } from "../../contexts/TasksContext";
import { Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { taskService } from "../../services/taskService";
import { Dropdown } from "./Dropdown";
import {
  priorityMap,
  statusMap,
  getTimeMessage,
  statusOptions,
  priorityOptions,
} from "../../utils/taskUtils";

type TaskProps = {
  task: TTask;
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const Task = ({ task }: TaskProps) => {
  const { setSelectedTask } = useTasks();
  const [localTask, setLocalTask] = useState(task);

  const changeStatus = async (status: TTask["status"]) => {
    const updated = { ...localTask, status };
    setLocalTask(updated);
    await taskService.updateTask(task.id, updated);
  };

  const changePriority = async (priority: TTask["priority"]) => {
    const updated = { ...localTask, priority };
    setLocalTask(updated);
    await taskService.updateTask(task.id, updated);
  };

  const handleChange = <K extends keyof TTask>(field: K, value: TTask[K]) => {
    setLocalTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = async () => {
    if (JSON.stringify(localTask) === JSON.stringify(task)) return;

    await taskService.updateTask(task.id, localTask);
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
      <div
        className={`flex justify-between items-center p-3 border-2
            ${currentPriority.border} rounded-lg bg-zinc-800`}
      >
        <div className="flex flex-col gap-5 w-2/3">
          <div className="flex gap-4 flex-col lg:flex-row items-baseline">
            <h3
              className={`font-semibold ${
                localTask.status === "concluded"
                  ? "line-through text-zinc-400"
                  : ""
              }`}
            >
              <input
                value={
                  localTask.title.length > 60
                    ? `${localTask.title.substring(0, 60)}...`
                    : localTask.title
                }
                onChange={(e) => handleChange("title", e.target.value)}
                onBlur={handleBlur}
                className="bg-transparent outline-none border border-transparent duration-100 focus:bg-zinc-700 focus:border-white rounded-md p-1 "
              />
            </h3>

            {localTask.status !== "concluded" && (
              <p className="text-md text-zinc-400 bg-zinc-950 px-2 py-1 rounded-sm">
                <input
                  type="date"
                  value={localTask.due_date}
                  onChange={(e) => handleChange("due_date", e.target.value)}
                  onBlur={handleBlur}
                  className="hide-date-icon appearance-none"
                />
              </p>
            )}
          </div>

          <h4 className="text-zinc-400 w-full">
            <textarea
              value={localTask.description}
              onChange={(e) => handleChange("description", e.target.value)}
              onBlur={handleBlur}
              className="w-full bg-transparent outline-none resize-none duration-100 focus:bg-zinc-700 focus:border-white rounded-sm"
            />
          </h4>

          {localTask.status !== "concluded" && (
            <p className={`text-xs ${timeColor}`}>{timeMessage}</p>
          )}
        </div>

        <div className="flex flex-col items-end justify-center gap-4 text-sm">
          <div className="flex gap-4 w-max">
            <Dropdown
              value={localTask.priority}
              options={priorityOptions}
              onChange={changePriority}
              buttonClass={`font-bold px-2 py-1 ${currentPriority.color}`}
              renderLabel={(value) => `Prioridade: ${priorityMap[value].label}`}
            />
            <button
              onClick={() => setSelectedTask(task)}
              className="bg-indigo-600 hover:bg-indigo-800 duration-150 p-2 rounded-full"
            >
              <Eye size={20} />
            </button>
          </div>

          <div className="flex gap-4">
            <Dropdown
              value={localTask.status}
              options={statusOptions}
              onChange={changeStatus}
              buttonClass={`flex items-center gap-2 rounded-sm px-2 py-1 ${currentStatus.bg} ${currentStatus.color}`}
            />
            <button className="bg-red-600 hover:bg-red-800 duration-150 p-2 rounded-full">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

import {
  AlarmClockCheck,
  AlarmClockPlus,
  Check,
  Eye,
  Play,
  Trash2,
} from "lucide-react";
import { Dropdown } from "./Dropdown";
import {
  priorityMap,
  statusMap,
  getTimeMessage,
  statusOptions,
  priorityOptions,
} from "../../utils/taskUtils";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import { DatePicker } from "../_Common/DatePicker";
import { TimeInput } from "../_Common/TimeInput";
import { useTaskItem } from "../../hooks/useTaskItem";
import type { TTask } from "../../types/TTask";

type TaskProps = {
  task: TTask;
};

export const TaskItem = ({ task }: TaskProps) => {
  const {
    localData,
    loading,
    settings,
    isDetailsPage,
    showStartDate,
    showTime,
    showStartTime,
    handleChange,
    handleBlur,
    handleKeyDown,
    handleDescriptionKeyDown,
    handleDelete,
    changeStatus,
    changePriority,
    handleImmediateChange,
    navigateToDetails,
  } = useTaskItem(task);

  if (!settings) return <LoadingOverlay show />;

  const { msg: timeMessage, color: timeColor } = getTimeMessage(
    new Date(localData.due_date)
  );

  const currentPriority = priorityMap[localData.priority];
  const currentStatus = statusMap[localData.status];

  return (
    <>
      <LoadingOverlay show={loading} />

      <div
        className={`flex justify-between items-center p-3 border-2
          ${currentPriority.border} rounded-lg bg-zinc-800`}
      >
        <div className="flex flex-col gap-4 w-full">
          <div className="flex gap-4 flex-wrap">
            {showStartDate && localData.status !== "concluded" && (
              <DatePicker
                value={localData.start_date}
                onChange={(date) =>
                  handleImmediateChange("start_date", date || "")
                }
                icon={Play}
                title="Data de Início"
              />
            )}

            {localData.status !== "concluded" && (
              <DatePicker
                value={localData.due_date}
                onChange={(date) =>
                  handleImmediateChange("due_date", date || "")
                }
                icon={Check}
                title="Data de Prazo"
              />
            )}

            {showStartTime && localData.status !== "concluded" && (
              <TimeInput
                value={localData.start_time}
                onChange={(time) =>
                  handleImmediateChange("start_time", time || "")
                }
                title="Hora de início"
                icon={AlarmClockPlus}
              />
            )}

            {showTime && localData.status !== "concluded" && (
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

          <input
            value={localData.title}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Insira o Título"
            className={`text-xl font-semibold outline-none border border-transparent
              duration-100 focus:bg-zinc-900 focus:border-accent
              hover:bg-zinc-700 rounded-md p-1 
              ${localData.status === "concluded" ? "line-through text-zinc-400" : ""}
              ${isDetailsPage ? "w-full" : "w-4/5"}`}
          />

          <textarea
            value={localData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleDescriptionKeyDown}
            spellCheck={false}
            className="outline-none resize-none rounded-sm border text-text
              border-transparent px-1 m-0 duration-100 focus:bg-zinc-900 focus:border-accent 
              focus:resize-y hover:bg-zinc-700 hover:resize-y w-9/10"
          />

          {localData.status !== "concluded" && (
            <p className={`px-1 text-xs ${timeColor}`}>{timeMessage}</p>
          )}
        </div>

        <div className="flex flex-col items-end justify-center gap-4 text-sm ms-5">
          <div className="flex gap-4 w-max">
            <Dropdown
              value={localData.priority}
              options={priorityOptions}
              onChange={changePriority}
              buttonClass={`font-bold px-2 py-1 hover:bg-zinc-700 rounded-sm duration-100
                ${currentPriority.color}`}
              renderLabel={(value) => `Prioridade: ${priorityMap[value].label}`}
            />

            {!isDetailsPage && (
              <button
                onClick={navigateToDetails}
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
              value={localData.status}
              options={statusOptions}
              onChange={changeStatus}
              buttonClass={`flex items-center gap-2 rounded-sm px-2 py-1 duration-100 border
                border-transparent hover:bg-zinc-950
                ${currentStatus.bg} ${currentStatus.color}`}
            />

            <button
              onClick={handleDelete}
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

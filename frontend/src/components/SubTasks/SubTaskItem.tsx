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
import {
  getTimeMessage,
  priorityMap,
  priorityOptions,
} from "../../utils/taskUtils";
import { Dropdown } from "../_Common/Dropdown";
import { useTextareaOverflow } from "../../hooks/useTextareaOverflow";
import { useAutoResizeTextarea } from "../../hooks/useAutoResizeTextarea";
import {
  AssignmentControl,
  type TProjectMember,
} from "../_Common/AssignmentControl";
import { useTasks } from "../../hooks/useTasks";

type Props = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  projectMembers?: TProjectMember[];
  isProjectOwner?: boolean;
};

export const SubTaskItem = ({
  subtask,
  taskId,
  setLoading,
  projectMembers = [],
  isProjectOwner = false,
}: Props) => {
  const {
    localData,

    isDone,

    showStartDate,
    showPriority,
    showTime,
    showStartTime,

    handleChange,
    handleBlur,
    handleKeyDown,
    handleDescriptionKeyDown,
    handleImmediateChange,
    handleDelete,

    toggleStatus,
    changePriority,
  } = useSubTaskItem({ subtask, taskId, setLoading });

  const currentPriority = priorityMap[localData.priority];

  const {
    textareaRef,
    hasOverflow: descriptionOverflow,
    checkOverflow: checkDescriptionOverflow,
    startResizeTracking,
  } = useTextareaOverflow(localData.description);

  const { ref: titleRef, resize: resizeTitle } = useAutoResizeTextarea(
    localData.title
  );

  const { msg: timeMessage, color: timeColor } = getTimeMessage(
    localData.due_date
  );

  const { assignments, assignUserToSubTask, removeTaskAssignment } = useTasks();

  const subtaskAssignments = assignments.filter(
    (assignment) => assignment.subtask_id === subtask.id
  );

  const canManageAssignments = isProjectOwner && projectMembers.length >= 2;
  const shouldShowAssignments = projectMembers.length >= 2;

  return (
    <div className="grid gap-3 rounded-md border border-zinc-600 bg-zinc-800 p-3 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <button
        onClick={toggleStatus}
        className={`
    place-self-center flex h-6 w-6 items-center justify-center rounded-md border
    transition-all duration-300 mt-4
    ${
      isDone
        ? "border-purple-700 bg-purple-700"
        : "border-zinc-600 bg-zinc-900 hover:border-zinc-400"
    }
  `}
      >
        {isDone && <Check size={16} className="text-white" />}
      </button>

      <div className="flex min-w-0 flex-col gap-3">
        {shouldShowAssignments && (
          <div className="border-b border-zinc-700 pb-3">
            <AssignmentControl
              assignments={subtaskAssignments}
              members={projectMembers}
              canManage={canManageAssignments}
              onAssign={async (userId) => {
                await assignUserToSubTask(subtask.id, userId);
              }}
              onRemove={removeTaskAssignment}
            />
          </div>
        )}

        <textarea
          value={localData.title}
          ref={titleRef}
          onChange={(e) => {
            handleChange("title", e.target.value);
            requestAnimationFrame(resizeTitle);
          }}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder="Título da subtarefa"
          rows={1}
          spellCheck={false}
          disabled={isDone}
          className={`w-full resize-none overflow-hidden rounded-md border border-transparent p-1 text-xl outline-none
          duration-100 hover:bg-zinc-700 focus:border-accent focus:bg-zinc-900
          ${isDone ? "line-through text-zinc-400" : ""}`}
        />

        <div className="relative">
          <textarea
            ref={textareaRef}
            value={localData.description ?? ""}
            onChange={(e) => {
              handleChange("description", e.target.value);
              requestAnimationFrame(checkDescriptionOverflow);
            }}
            onBlur={handleBlur}
            onFocus={checkDescriptionOverflow}
            onMouseEnter={checkDescriptionOverflow}
            onMouseDown={startResizeTracking}
            onKeyDown={handleDescriptionKeyDown}
            spellCheck={false}
            disabled={isDone}
            rows={2}
            className={`w-full resize-none overflow-hidden rounded-md border border-transparent p-1 outline-none duration-100
            hover:bg-zinc-700 hover:resize-y focus:border-accent focus:bg-zinc-900 focus:resize-y
            ${isDone ? "line-through text-zinc-500" : ""}`}
          />

          {descriptionOverflow && (
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-7 items-center justify-end rounded-b-md bg-linear-to-t from-zinc-800 via-zinc-800/50 to-transparent px-3 pb-0.5">
              <span className="text-[10px] text-zinc-300">
                arraste para ver mais
              </span>
            </div>
          )}
        </div>

        {!isDone && (
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-baseline gap-3">
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

              <p className={`px-1 pt-2 text-xs ${timeColor}`}>{timeMessage}</p>
            </div>

            {showPriority && (
              <div className="shrink-0">
                <Dropdown
                  value={localData.priority}
                  options={priorityOptions}
                  onChange={changePriority}
                  buttonClass={`px-2 py-1 rounded-sm text-sm font-semibold
                  ${currentPriority.color}
                  hover:bg-zinc-700 duration-100`}
                  renderLabel={(value) =>
                    `Prioridade: ${priorityMap[value].label}`
                  }
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-3">
        <button
          className="rounded-full bg-red-600 p-2 hover:bg-red-800"
          onClick={handleDelete}
          title="Excluir subtarefa"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

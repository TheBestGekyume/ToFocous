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
import type { TTask, TSubTask } from "../../types/TTask";
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
import { FeedbackToast } from "../_Common/FeedbackToast";

type Props = {
  subtask: TSubTask;
  taskId: string;
  parentTask: TTask;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  projectMembers?: TProjectMember[];
  isProjectOwner?: boolean;
};

export const SubTaskItem = ({
  subtask,
  taskId,
  parentTask,
  setLoading,
  projectMembers = [],
  isProjectOwner = false,
}: Props) => {
  const {
    localData,
    feedback,
    resetSignal,

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
  } = useSubTaskItem({ subtask, taskId, parentTask, setLoading });

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
    <>
      {feedback && (
        <FeedbackToast type={feedback.type} message={feedback.message} />
      )}

      <div
        className="
      grid w-full min-w-0
      grid-cols-[auto_minmax(0,1fr)]
      gap-x-3 gap-y-3
      rounded-md border border-zinc-600
      bg-zinc-800 p-3

      md:grid-cols-[auto_minmax(0,1fr)_auto]
      md:gap-4
      md:p-4
    "
      >
        <button
          type="button"
          onClick={toggleStatus}
          className={`
          mt-1 flex h-6 w-6 shrink-0 items-center justify-center
          self-start rounded-md border
          transition-all duration-300

        ${
          isDone
            ? "border-purple-700 bg-purple-700"
            : "border-zinc-600 bg-zinc-900 hover:border-zinc-400"
        }
      `}
          aria-label={isDone ? "Reabrir subtarefa" : "Concluir subtarefa"}
          title={isDone ? "Reabrir subtarefa" : "Concluir subtarefa"}
        >
          {isDone && <Check size={20} className="text-white" />}
        </button>

        <div className="flex min-w-0 flex-col gap-3">
          {shouldShowAssignments && (
            <div className="min-w-0 border-b border-zinc-700 pb-3">
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
            onChange={(event) => {
              handleChange("title", event.target.value);
              requestAnimationFrame(resizeTitle);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Título da subtarefa"
            rows={1}
            spellCheck={false}
            disabled={isDone}
            className={`
            w-full resize-none overflow-hidden
            rounded-md border border-transparent p-1
            text-lg outline-none duration-100
            hover:bg-zinc-700
            focus:border-accent focus:bg-zinc-900
            sm:text-xl

          ${isDone ? "line-through text-zinc-400" : ""}
        `}
          />

          <div className="relative min-w-0">
            <textarea
              ref={textareaRef}
              value={localData.description ?? ""}
              onChange={(event) => {
                handleChange("description", event.target.value);
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
              className={`
              w-full resize-none overflow-hidden
              rounded-md border border-transparent p-1
              outline-none duration-100
              hover:bg-zinc-700 hover:resize-y
              focus:border-accent focus:bg-zinc-900 focus:resize-y

            ${isDone ? "line-through text-zinc-500" : ""}
          `}
            />

            {descriptionOverflow && (
              <div
                className="
              pointer-events-none absolute inset-x-0 bottom-0
              flex h-7 items-center justify-end
              rounded-b-md
              bg-linear-to-t
              from-zinc-800 via-zinc-800/50 to-transparent
              px-2 pb-0.5
            "
              >
                <span className="text-[10px] text-zinc-300">
                  arraste para ver mais
                </span>
              </div>
            )}
          </div>

          {!isDone && (
            <div
              className="flex min-w-0 flex-col gap-3
              sm:flex-row sm:flex-wrap sm:items-end
              sm:justify-between"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                {showStartDate && (
                  <DatePicker
                    value={localData.start_date}
                    onChange={(date) =>
                      handleImmediateChange("start_date", date ?? "")
                    }
                    title="Data de início"
                    icon={Play}
                  />
                )}

                <DatePicker
                  value={localData.due_date}
                  onChange={(date) =>
                    handleImmediateChange("due_date", date ?? "")
                  }
                  title="Data de prazo"
                  icon={Check}
                />

                {showStartTime && (
                  <TimeInput
                    value={localData.start_time}
                    onChange={(time) =>
                      handleImmediateChange("start_time", time ?? "")
                    }
                    title="Hora de início"
                    icon={AlarmClockPlus}
                      resetSignal={resetSignal}
                  />
                )}

                {showTime && (
                  <TimeInput
                    value={localData.due_time}
                    onChange={(time) =>
                      handleImmediateChange("due_time", time ?? "")
                    }
                    title="Hora de prazo"
                    icon={AlarmClockCheck}
                      resetSignal={resetSignal}
                  />
                )}

                <p
                  className={`w-full px-1 pt-1 text-xs sm:w-auto ${timeColor}`}
                >
                  {timeMessage}
                </p>
              </div>

              {showPriority && (
                <div className="min-w-0 self-start sm:ml-auto sm:self-auto">
                  <Dropdown
                    value={localData.priority}
                    options={priorityOptions}
                    onChange={changePriority}
                    buttonClass={`
                    max-w-full rounded-sm px-2 py-1
                    text-left text-sm font-semibold
                    duration-100 hover:bg-zinc-700
                    ${currentPriority.color}
                `}
                    renderLabel={(value) =>
                      `Prioridade: ${priorityMap[value].label}`
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className="
    col-span-2 flex justify-end
    border-t border-zinc-700 pt-3

    md:col-span-1 md:self-center
    md:border-0 md:pt-0
  "
        >
          <button
            type="button"
            onClick={handleDelete}
            className="
      flex h-10 w-fit items-center justify-center gap-2
      rounded-md bg-red-600 px-3 py-2
      text-sm font-medium duration-150
      hover:bg-red-800

      md:h-10 md:w-10 md:shrink-0
      md:rounded-full md:p-2
    "
            title="Excluir subtarefa"
            aria-label="Excluir subtarefa"
          >
            <Trash2 size={20} />

            <span className="md:hidden">Excluir</span>
          </button>
        </div>
      </div>
    </>
  );
};

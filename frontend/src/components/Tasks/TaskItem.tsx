import {
  AlarmClockCheck,
  AlarmClockPlus,
  Check,
  // Eye,
  PictureInPicture,
  Play,
  Trash2,
} from "lucide-react";
import { Dropdown } from "../_Common/Dropdown";
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
import { useTextareaOverflow } from "../../hooks/useTextareaOverflow";
import { useAutoResizeTextarea } from "../../hooks/useAutoResizeTextarea";
import {
  AssignmentControl,
  type TProjectMember,
} from "../_Common/AssignmentControl";
import { useTasks } from "../../hooks/useTasks";

type TaskProps = {
  task: TTask;
  projectMembers?: TProjectMember[];
  isProjectOwner?: boolean;
};

export const TaskItem = ({
  task,
  projectMembers = [],
  isProjectOwner = false,
}: TaskProps) => {
  const {
    localData,
    loading,
    settings,
    isDone,
    isDetailsPage,
    showStartDate,
    showTime,
    showStartTime,

    handleChange,
    handleBlur,
    handleKeyDown,
    handleDescriptionKeyDown,
    handleDelete,
    handleImmediateChange,
    changeStatus,
    changePriority,
    navigateToDetails,
  } = useTaskItem(task);

  const { msg: timeMessage, color: timeColor } = getTimeMessage(
    localData.due_date
  );

  const currentPriority = priorityMap[localData.priority];
  const currentStatus = statusMap[localData.status];

  const { ref: titleRef, resize: resizeTitle } = useAutoResizeTextarea(
    localData.title
  );

  const {
    textareaRef,
    hasOverflow: descriptionOverflow,
    checkOverflow: checkDescriptionOverflow,
    startResizeTracking,
  } = useTextareaOverflow(localData.description);

  const { assignments, assignUserToTask, removeTaskAssignment } = useTasks();

  const taskAssignments = assignments.filter(
    (assignment) => assignment.task_id === task.id
  );

  const canManageAssignments = isProjectOwner && projectMembers.length >= 2;

  if (!settings) return <LoadingOverlay show />;

  return (
    <>
      <LoadingOverlay show={loading} />

      <div
        className={`grid w-full min-w-0 grid-cols-1 gap-3 rounded-lg border-2 bg-zinc-800 p-3
    sm:gap-4 sm:p-4 md:grid-cols-[minmax(0,1fr)_auto]  ${currentPriority.border}`}
      >
        <div className="flex min-w-0 flex-col gap-3 sm:gap-4">
          <div className="flex min-w-0 flex-wrap gap-2 sm:gap-4">
            {showStartDate && !isDone && (
              <DatePicker
                value={localData.start_date}
                onChange={(date) =>
                  handleImmediateChange("start_date", date || "")
                }
                icon={Play}
                title="Data de início"
              />
            )}
            {!isDone && (
              <DatePicker
                value={localData.due_date}
                onChange={(date) =>
                  handleImmediateChange("due_date", date || "")
                }
                icon={Check}
                title="Data de prazo"
                required
              />
            )}
            {showStartTime && !isDone && (
              <TimeInput
                value={localData.start_time}
                onChange={(time) => handleImmediateChange("start_time", time)}
                title="Hora de início"
                icon={AlarmClockPlus}
              />
            )}
            {showTime && !isDone && (
              <TimeInput
                value={localData.due_time}
                onChange={(time) => handleImmediateChange("due_time", time)}
                title="Hora de prazo"
                icon={AlarmClockCheck}
              />
            )}
          </div>
          <textarea
            ref={titleRef}
            value={localData.title}
            onChange={(e) => {
              handleChange("title", e.target.value);
              requestAnimationFrame(resizeTitle);
            }}
            disabled={isDone}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Insira o título"
            rows={1}
            spellCheck={false}
            className={`w-full resize-none overflow-hidden rounded-md border border-transparent p-1
            text-lg font-semibold outline-none duration-100 hover:bg-zinc-700 focus:border-accent 
            focus:bg-zinc-900 sm:text-xl  ${isDone ? "line-through text-zinc-400" : ""}`}
          />
          <div className="relative w-full">
            <textarea
              ref={textareaRef}
              value={localData.description ?? ""}
              onChange={(e) => {
                handleChange("description", e.target.value);
                requestAnimationFrame(checkDescriptionOverflow);
              }}
              disabled={isDone}
              onBlur={handleBlur}
              onFocus={checkDescriptionOverflow}
              onMouseEnter={checkDescriptionOverflow}
              onMouseDown={startResizeTracking}
              onKeyDown={handleDescriptionKeyDown}
              spellCheck={false}
              rows={2}
              className={`w-full resize-none overflow-hidden rounded-sm border border-transparent px-1 m-0 text-text outline-none duration-100
            focus:bg-zinc-900 focus:border-accent focus:resize-y hover:resize-y
            hover:bg-zinc-700 ${isDone ? "line-through text-zinc-500" : ""}`}
            />

            {descriptionOverflow && (
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex h-7 items-center justify-end rounded-b-sm bg-linear-to-t from-zinc-800 via-zinc-800/50 to-transparent px-3 pb-0.5">
                <span className="text-[10px] text-zinc-300">
                  arraste para ver mais
                </span>
              </div>
            )}
          </div>
          {!isDone && (
            <p className={`px-1 text-xs ${timeColor}`}>{timeMessage}</p>
          )}
        </div>

        <aside
          className="flex w-full min-w-0 flex-col items-stretch justify-start gap-3 text-sm
          md:w-auto md:shrink-0 md:items-end md:justify-center md:gap-4"
        >
          <div
            className="flex w-full min-w-0 flex-wrap items-center
          justify-between gap-2 md:w-max md:justify-end md:gap-4"
          >
            {!isDone && (
              <Dropdown
                value={localData.priority}
                options={priorityOptions}
                onChange={changePriority}
                buttonClass={`max-w-full rounded-sm px-2 py-1
                text-left font-bold duration-100
          hover:bg-zinc-700
          ${currentPriority.color}
        `}
                renderLabel={(value) =>
                  `Prioridade: ${priorityMap[value].label}`
                }
              />
            )}

            {!isDetailsPage && (
              <button
                type="button"
                onClick={navigateToDetails}
                className="
          shrink-0 rounded-full bg-indigo-600 p-2
          duration-150 hover:bg-indigo-800
        "
                title="Subtarefas"
              >
                <PictureInPicture size={22} />
              </button>
            )}
          </div>

          <div
            className={`
      flex w-full min-w-0 flex-wrap items-center
      justify-between gap-2
      md:w-auto md:justify-end md:gap-4

      ${
        isDetailsPage
          ? "md:flex-col md:items-end"
          : "md:flex-row md:items-center"
      }
    `}
          >
            <Dropdown
              value={localData.status}
              options={statusOptions}
              onChange={changeStatus}
              buttonClass={`
        flex max-w-full items-center gap-2 rounded-sm
        border border-transparent px-2 py-1
        text-left duration-100 hover:bg-zinc-950
        ${currentStatus.bg}
        ${currentStatus.color}
      `}
            />

            <button
              type="button"
              onClick={handleDelete}
              className="
        shrink-0 rounded-full bg-red-600 p-2
        duration-150 hover:bg-red-800
      "
              title="Excluir tarefa"
            >
              <Trash2 size={22} />
            </button>
          </div>
        </aside>
        {projectMembers.length >= 2 && (
          <div className="min-w-0 border-t border-zinc-700 pt-3 md:col-span-2">
            <AssignmentControl
              assignments={taskAssignments}
              members={projectMembers}
              canManage={canManageAssignments}
              onAssign={async (userId) => {
                await assignUserToTask(task.id, userId);
              }}
              onRemove={removeTaskAssignment}
            />
          </div>
        )}
      </div>
    </>
  );
};

import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";
import { CalendarDays, GripVertical } from "lucide-react";
import type { TTask } from "../../types/TTask";
import {
  formatDateBR,
  getTimeMessage,
  priorityMap,
  statusMap,
} from "../../utils/taskUtils";

type KanbanTaskCardProps = {
  task: TTask;
  isUpdating: boolean;
};

export const KanbanTaskCard = ({ task, isUpdating }: KanbanTaskCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
    disabled: isUpdating,
  });

  const timeMessage = getTimeMessage(task.due_date);

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`
        rounded-xl border bg-background-header p-4 shadow-sm duration-150
        ${priorityMap[task.priority].border}
        ${isDragging ? "scale-[1.02] opacity-70 shadow-lg" : ""}
        ${isUpdating ? "pointer-events-none opacity-60" : ""}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-semibold text-text">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-2 line-clamp-2 text-xs text-text/70">
              {task.description}
            </p>
          )}
        </div>

        <button
          type="button"
          aria-label={`Arrastar tarefa ${task.title}`}
          className="
            shrink-0 rounded-md p-1 text-text/60 duration-100
            hover:bg-background-body hover:text-text
          "
          {...listeners}
          {...attributes}
        >
          <GripVertical size={18} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`
            rounded-full px-2 py-1 text-xs font-medium
            ${priorityMap[task.priority].color}
            bg-background-body
          `}
        >
          {priorityMap[task.priority].label}
        </span>

        <span
          className={`
            flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium
            ${statusMap[task.status].bg}
            ${statusMap[task.status].color}
          `}
        >
          {statusMap[task.status].label}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1 text-text/70">
          <CalendarDays size={14} />
          {formatDateBR(task.due_date)}
        </span>

        <span className={timeMessage.color}>{timeMessage.msg}</span>
      </div>
    </article>
  );
};
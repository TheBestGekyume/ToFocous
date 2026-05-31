import { useDroppable } from "@dnd-kit/core";
import type { TStatus, TTask } from "../../types/TTask";
import { KanbanTaskCard } from "./KanbanTaskCard";

type KanbanColumnProps = {
  id: TStatus;
  title: string;
  tasks: TTask[];
  updatingTaskId: string | null;
};

export const KanbanColumn = ({
  id,
  title,
  tasks,
  updatingTaskId,
}: KanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: "column",
      status: id,
    },
  });

  return (
    <section
      ref={setNodeRef}
      className={`
        flex min-h-[420px] w-full min-w-[280px] flex-col rounded-2xl
        border-2 bg-background-header/50 p-4 duration-150
        ${isOver ? "border-accent bg-background-header" : "border-secondary"}
      `}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-semibold text-text">{title}</h2>

        <span className="rounded-full bg-background-body px-2 py-1 text-xs text-text/70">
          {tasks.length}
        </span>
      </header>

      <div className="flex flex-1 flex-col gap-3">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <KanbanTaskCard
              key={task.id}
              task={task}
              isUpdating={updatingTaskId === task.id}
            />
          ))
        ) : (
          <div
            className="
              flex flex-1 items-center justify-center rounded-xl border
              border-dashed border-secondary/20 p-4 text-center text-sm text-text/50
            "
          >
            Nenhuma tarefa nesta coluna.
          </div>
        )}
      </div>
    </section>
  );
};
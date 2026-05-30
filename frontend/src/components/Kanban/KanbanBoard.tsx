import {
  closestCenter,
  DndContext,
  type DragEndEvent,
} from "@dnd-kit/core";
import type { TStatus, TTask } from "../../types/TTask";
import type { KanbanColumnConfig } from "../../hooks/useKanban";
import { isTaskStatus } from "../../hooks/useKanban";
import { KanbanColumn } from "./KanbanColumn";

type KanbanTasksByStatus = Record<TStatus, TTask[]>;

type KanbanBoardProps = {
  columns: KanbanColumnConfig[];
  tasksByStatus: KanbanTasksByStatus;
  updatingTaskId: string | null;
  onUpdateTaskStatus: (taskId: string, status: TStatus) => Promise<void>;
};

export const KanbanBoard = ({
  columns,
  tasksByStatus,
  updatingTaskId,
  onUpdateTaskStatus,
}: KanbanBoardProps) => {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const taskId = String(active.id);
    const newStatus = String(over.id);

    if (!isTaskStatus(newStatus)) return;

    await onUpdateTaskStatus(taskId, newStatus);
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            tasks={tasksByStatus[column.id]}
            updatingTaskId={updatingTaskId}
          />
        ))}
      </div>
    </DndContext>
  );
};
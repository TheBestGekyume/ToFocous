import { createPortal } from "react-dom";
import {
  agendaDateTypeLabel,
  agendaPriorityStyle,
  getReadableDate,
  type AgendaItem,
} from "../../utils/agendaUtils";


type AgendaPopoverPosition = {
  top: number;
  left: number;
};

type AgendaPopoverProps = {
  dateKey: string;
  items: AgendaItem[];
  position: AgendaPopoverPosition;
};

export const AgendaPopover = ({
  dateKey,
  items,
  position,
}: AgendaPopoverProps) => {
  const visibleItems = items.slice(0, 3);
  const hiddenItemsCount = items.length - visibleItems.length;

  const content = (
    <div
      style={{
        top: position.top,
        left: position.left,
      }}
      className="fixed z-40 w-80 rounded-xl border border-zinc-700 bg-zinc-950 p-4 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <div className="mb-3">
        <p className="text-sm font-semibold text-zinc-100">
          {getReadableDate(dateKey)}
        </p>

        <p className="text-xs text-zinc-400">
          {items.length} item{items.length !== 1 ? "s" : ""} neste dia
        </p>
      </div>

      <div className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
        {visibleItems.map((item) => {
          const priority = agendaPriorityStyle[item.priority];

          return (
            <div
              key={`${item.type}-${item.id}-${item.dateType}`}
              className={`rounded-lg border ${priority.border} bg-zinc-900 p-3`}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${priority.bg}`}
                >
                  {priority.label}
                </span>

                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                  {agendaDateTypeLabel[item.dateType]}
                </span>
              </div>

              <p
                className={`text-sm font-semibold ${
                  item.status === "concluded"
                    ? "text-zinc-500 line-through"
                    : "text-zinc-100"
                }`}
              >
                {item.title}
              </p>

              <p className="mt-1 text-xs text-zinc-400">
                {item.type === "task" ? "Task" : "Subtask"}
                {item.parentTitle ? ` de "${item.parentTitle}"` : ""}
              </p>
            </div>
          );
        })}
      </div>

      {hiddenItemsCount > 0 && (
        <p className="mt-3 rounded-md bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
          +{hiddenItemsCount} item{hiddenItemsCount !== 1 ? "s" : ""}. Clique no
          dia para ver todos.
        </p>
      )}
    </div>
  );

  return createPortal(content, document.body);
};
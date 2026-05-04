import { createPortal } from "react-dom";
import { ExternalLink, GripHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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

type DragData = {
  startX: number;
  startY: number;
  initialTop: number;
  initialLeft: number;
};

type AgendaPopoverProps = {
  dateKey: string;
  items: AgendaItem[];
  isPinned: boolean;
  position: AgendaPopoverPosition;
  onClose: () => void;
  onUpdateDate: (item: AgendaItem, newDate: string) => Promise<void>;
  onNavigate: (item: AgendaItem) => void;
};

export const AgendaPopover = ({
  dateKey,
  items,
  isPinned,
  position,
  onClose,
  onUpdateDate,
  onNavigate,
}: AgendaPopoverProps) => {
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const dragDataRef = useRef<DragData | null>(null);

  const [popoverPosition, setPopoverPosition] =
    useState<AgendaPopoverPosition>(position);

  const [isDragging, setIsDragging] = useState(false);

  const visibleItems = items.slice(0, 3);
  const hiddenItemsCount = items.length - visibleItems.length;

  useEffect(() => {
    setPopoverPosition(position);
  }, [position.top, position.left, dateKey, position]);

  const clampPosition = (
    nextPosition: AgendaPopoverPosition
  ): AgendaPopoverPosition => {
    const spacing = 8;

    const popoverWidth = popoverRef.current?.offsetWidth ?? 320;
    const popoverHeight = popoverRef.current?.offsetHeight ?? 420;

    const minLeft = window.scrollX + spacing;
    const maxLeft = window.scrollX + window.innerWidth - popoverWidth - spacing;

    const minTop = window.scrollY + spacing;
    const maxTop =
      window.scrollY + window.innerHeight - popoverHeight - spacing;

    return {
      left: Math.min(
        Math.max(nextPosition.left, minLeft),
        Math.max(minLeft, maxLeft)
      ),
      top: Math.min(
        Math.max(nextPosition.top, minTop),
        Math.max(minTop, maxTop)
      ),
    };
  };

  const handleDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isPinned) return;

    event.preventDefault();
    event.stopPropagation();

    dragDataRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      initialTop: popoverPosition.top,
      initialLeft: popoverPosition.left,
    };

    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handlePointerMove = (event: PointerEvent) => {
      const dragData = dragDataRef.current;

      if (!dragData) return;

      const deltaX = event.clientX - dragData.startX;
      const deltaY = event.clientY - dragData.startY;

      const nextPosition = {
        top: dragData.initialTop + deltaY,
        left: dragData.initialLeft + deltaX,
      };

      setPopoverPosition(clampPosition(nextPosition));
    };

    const handlePointerUp = () => {
      dragDataRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [isDragging]);

  useEffect(() => {
    if (!isPinned) return;

    const handleClickOutside = (event: MouseEvent | PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) return;

      const clickedInsidePopover = popoverRef.current?.contains(target);

      if (clickedInsidePopover) return;

      onClose();
    };

    document.addEventListener("pointerdown", handleClickOutside);

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [isPinned, onClose]);

  const content = (
    <div
      ref={popoverRef}
      style={{
        top: popoverPosition.top,
        left: popoverPosition.left,
      }}
      className={`absolute z-50 w-80 rounded-xl border border-zinc-700
      bg-zinc-950 p-4 shadow-2xl ${isDragging ? "select-none opacity-95" : ""}`}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={(e) => e.stopPropagation()}
    >
      <div
        onPointerDown={handleDragStart}
        className={`mb-3 flex items-start justify-between gap-3 ${
          isPinned ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        title={isPinned ? "Arraste para mover" : undefined}
      >
        <div>
          <div className="flex items-center gap-2">
            {isPinned && <GripHorizontal size={16} className="text-zinc-500" />}

            <p className="text-sm font-semibold text-zinc-100">
              {getReadableDate(dateKey)}
            </p>
          </div>

          <p className="text-xs text-zinc-400">
            {items.length} item{items.length !== 1 ? "s" : ""} neste dia
          </p>
        </div>

        {isPinned && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="rounded-full bg-zinc-800 p-1 text-zinc-300 hover:bg-zinc-700"
            title="Fechar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto pr-1">
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

              <div className="mt-3 flex flex-col gap-2">
                <label className="flex flex-col gap-1 text-xs text-zinc-400">
                  Realocar {agendaDateTypeLabel[item.dateType].toLowerCase()}
                  <input
                    type="date"
                    value={item.date}
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => onUpdateDate(item, e.target.value)}
                    className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1
                    text-sm text-zinc-100 outline-none duration-150 focus:border-accent"
                  />
                </label>

                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate(item);
                  }}
                  className="flex items-center justify-center gap-2 rounded-md bg-indigo-600
                  px-3 py-2 text-sm font-semibold text-white duration-150 hover:bg-indigo-800"
                >
                  <ExternalLink size={16} />
                  {item.type === "task" ? "Abrir task" : "Abrir task pai"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {hiddenItemsCount > 0 && (
        <p className="mt-3 rounded-md bg-zinc-900 px-3 py-2 text-xs text-zinc-300">
          +{hiddenItemsCount} item{hiddenItemsCount !== 1 ? "s" : ""}. Clique no
          dia para fixar a visualização.
        </p>
      )}

      {!isPinned && (
        <p className="mt-2 text-xs text-zinc-500">
          Passe o mouse para visualizar ou clique no dia para manter aberto.
        </p>
      )}

      {isPinned && (
        <p className="mt-2 text-xs text-zinc-500">
          Arraste pelo cabeçalho para reposicionar.
        </p>
      )}
    </div>
  );

  return createPortal(content, document.body);
};

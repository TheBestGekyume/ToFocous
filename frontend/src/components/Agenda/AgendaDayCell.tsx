import { useRef, useState } from "react";
import { AgendaPopover } from "./AgendaPopover";
import { agendaPriorityStyle, type AgendaItem } from "../../utils/agendaUtils";

type AgendaDayCellProps = {
  day: Date;
  dateKey: string;
  items: AgendaItem[];
  isToday: boolean;
  isActive: boolean;
  onHoverDate: (dateKey: string | null) => void;
  onOpenModal: (dateKey: string) => void;
};

type PopoverPosition = {
  top: number;
  left: number;
};

export const AgendaDayCell = ({
  day,
  dateKey,
  items,
  isToday,
  isActive,
  onHoverDate,
  onOpenModal,
}: AgendaDayCellProps) => {
  const hasItems = items.length > 0;

  const cellRef = useRef<HTMLDivElement | null>(null);
  const [popoverPosition, setPopoverPosition] = useState<PopoverPosition>({
    top: 0,
    left: 0,
  });

  const updatePopoverPosition = () => {
    if (!cellRef.current) return;

    const rect = cellRef.current.getBoundingClientRect();

    const popoverWidth = 320;
    const estimatedPopoverHeight = 360;
    const spacing = 8;

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const hasSpaceOnRight = rect.right + spacing + popoverWidth <= viewportWidth;
    const hasSpaceOnLeft = rect.left - spacing - popoverWidth >= 0;

    let left: number;

    if (hasSpaceOnRight) {
      left = rect.right + spacing;
    } else if (hasSpaceOnLeft) {
      left = rect.left - popoverWidth - spacing;
    } else {
      left = rect.left + rect.width / 2 - popoverWidth / 2;
    }

    const minLeft = spacing;
    const maxLeft = viewportWidth - popoverWidth - spacing;

    left = Math.min(Math.max(left, minLeft), Math.max(minLeft, maxLeft));

    let top = rect.top;
    const maxTop = viewportHeight - estimatedPopoverHeight - spacing;

    if (top > maxTop) {
      top = Math.max(spacing, maxTop);
    }

    if (top < spacing) {
      top = spacing;
    }

    setPopoverPosition({
      top,
      left,
    });
  };

  const handleClick = () => {
    if (!hasItems) return;

    onHoverDate(null);
    onOpenModal(dateKey);
  };

  const handleMouseEnter = () => {
    if (!hasItems) return;

    updatePopoverPosition();
    onHoverDate(dateKey);
  };

  const handleMouseLeave = () => {
    onHoverDate(null);
  };

  return (
    <div
      ref={cellRef}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
      className={`relative flex min-h-28 cursor-pointer flex-col rounded-lg border p-2
      text-left outline-none duration-150 ${
        isActive
          ? "border-accent bg-zinc-800"
          : "border-zinc-700 bg-zinc-950 hover:bg-zinc-800"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
            isToday ? "bg-accent text-white" : "text-zinc-200"
          }`}
        >
          {day.getDate()}
        </span>

        {hasItems && (
          <span className="text-xs text-zinc-400">{items.length}</span>
        )}
      </div>

      {hasItems && (
        <div className="flex flex-col gap-1">
          {items.slice(0, 3).map((item) => {
            const priority = agendaPriorityStyle[item.priority];

            return (
              <span
                key={`${item.type}-${item.id}-${item.dateType}`}
                className={`h-2 w-full rounded-full ${priority.bg}`}
                title={item.title}
              />
            );
          })}

          {items.length > 3 && (
            <span className="text-xs text-zinc-400">+{items.length - 3}</span>
          )}
        </div>
      )}

      {isActive && hasItems && (
        <AgendaPopover
          dateKey={dateKey}
          items={items}
          position={popoverPosition}
        />
      )}
    </div>
  );
};
import { AgendaDayCell } from "./AgendaDayCell";
import {
  type AgendaItem,
  formatDateKey,
  getMonthCalendarDays,
} from "../../utils/agendaUtils";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type AgendaCalendarProps = {
  currentMonth: Date;
  agendaItemsByDate: Record<string, AgendaItem[]>;
  activeDateKey: string | null;
  pinnedDateKey: string | null;
  onHoverDate: (dateKey: string | null) => void;
  onPinDate: (dateKey: string) => void;
  onClosePopover: () => void;
  onUpdateDate: (item: AgendaItem, newDate: string) => Promise<void>;
  onNavigate: (item: AgendaItem) => void;
};

export const AgendaCalendar = ({
  currentMonth,
  agendaItemsByDate,
  activeDateKey,
  pinnedDateKey,
  onHoverDate,
  onPinDate,
  onClosePopover,
  onUpdateDate,
  onNavigate,
}: AgendaCalendarProps) => {
  const monthDays = getMonthCalendarDays(currentMonth);
  const todayKey = formatDateKey(new Date());

  return (
    <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="py-2 text-center text-xs font-bold uppercase text-zinc-400"
          >
            {day}
          </div>
        ))}

        {monthDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-28 rounded-lg border border-transparent"
              />
            );
          }

          const dateKey = formatDateKey(day);
          const items = agendaItemsByDate[dateKey] ?? [];

          return (
            <AgendaDayCell
              key={dateKey}
              day={day}
              dateKey={dateKey}
              items={items}
              isToday={dateKey === todayKey}
              isActive={activeDateKey === dateKey}
              isPinned={pinnedDateKey === dateKey}
              onHoverDate={onHoverDate}
              onPinDate={onPinDate}
              onClosePopover={onClosePopover}
              onUpdateDate={onUpdateDate}
              onNavigate={onNavigate}
            />
          );
        })}
      </div>
    </div>
  );
};
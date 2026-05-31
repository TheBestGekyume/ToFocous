import { AgendaDayCell } from "./AgendaDayCell";
import { AgendaDayModal } from "./AgendaDayModal";
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
  selectedDateKey: string | null;
  onHoverDate: (dateKey: string | null) => void;
  onOpenModal: (dateKey: string) => void;
  onCloseModal: () => void;
  onUpdateDate: (item: AgendaItem, newDate: string) => Promise<void>;
  onNavigate: (item: AgendaItem) => void;
};

export const AgendaCalendar = ({
  currentMonth,
  agendaItemsByDate,
  activeDateKey,
  selectedDateKey,
  onHoverDate,
  onOpenModal,
  onCloseModal,
  onUpdateDate,
  onNavigate,
}: AgendaCalendarProps) => {
  const monthDays = getMonthCalendarDays(currentMonth);
  const todayKey = formatDateKey(new Date());

  const selectedItems = selectedDateKey
    ? (agendaItemsByDate[selectedDateKey] ?? [])
    : [];

  return (
    <div className="rounded-xl bg-background-header/50 border-2 border-secondary shadow-md p-4">
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
              onHoverDate={onHoverDate}
              onOpenModal={onOpenModal}
            />
          );
        })}
      </div>

      {selectedDateKey && selectedItems.length > 0 && (
        <AgendaDayModal
          isOpen={!!selectedDateKey}
          dateKey={selectedDateKey}
          items={selectedItems}
          onClose={onCloseModal}
          onUpdateDate={onUpdateDate}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};

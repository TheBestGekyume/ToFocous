import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { ptBR } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react";

import "react-day-picker/dist/style.css";

type DatePickerProps = {
  value?: string | null;
  onChange: (date: string | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  title: string;
  icon: LucideIcon;
  required?: boolean;
};

type CalendarCoords = {
  top: number;
  left: number;
};

const parseLocalDate = (date?: string | null) => {
  if (!date) return undefined;

  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day);
};

const formatDateToKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date?: string | null) => {
  if (!date) return null;

  const [year, month, day] = date.split("-");
  return `${day} / ${month} / ${year}`;
};

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

const capitalize = (value: string) => {
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const changeMonth = (currentMonth: Date, amount: number) => {
  return new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + amount,
    1
  );
};

const changeYear = (currentMonth: Date, amount: number) => {
  return new Date(
    currentMonth.getFullYear() + amount,
    currentMonth.getMonth(),
    1
  );
};

export const DatePicker = ({
  value,
  onChange,
  onBlur,
  placeholder = "Selecionar data",
  title = "",
  icon: Icon,
  required = false,
}: DatePickerProps) => {
  const selectedDate = useMemo(() => parseLocalDate(value), [value]);

  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date>(selectedDate ?? new Date());

  const [calendarCoords, setCalendarCoords] = useState<CalendarCoords>({
    top: 0,
    left: 0,
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const isInvalid = required && !value;

  const monthLabel = useMemo(() => {
    const label = new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      year: "numeric",
    }).format(month);

    return capitalize(label);
  }, [month]);

  useEffect(() => {
    if (!selectedDate) return;

    setMonth((currentMonth) => {
      const isSameMonth =
        currentMonth.getFullYear() === selectedDate.getFullYear() &&
        currentMonth.getMonth() === selectedDate.getMonth();

      if (isSameMonth) {
        return currentMonth;
      }

      return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    });
  }, [selectedDate]);
  const handleSelect = (date?: Date) => {
    if (!date) {
      if (!required) {
        onChange(null);
      }

      onBlur?.();
      return;
    }

    const formatted = formatDateToKey(date);

    onChange(formatted);
    onBlur?.();
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (!open || !containerRef.current || !calendarRef.current) return;

    const spacing = 10;

    const buttonRect = containerRef.current.getBoundingClientRect();
    const calendarRect = calendarRef.current.getBoundingClientRect();

    const availableBottom = window.innerHeight - buttonRect.bottom - spacing;
    const availableTop = buttonRect.top - spacing;

    const canOpenBottom = calendarRect.height <= availableBottom;
    const canOpenTop = calendarRect.height <= availableTop;

    const shouldOpenTop =
      !canOpenBottom && (canOpenTop || availableTop > availableBottom);

    const rawTop = shouldOpenTop
      ? buttonRect.top - calendarRect.height - spacing
      : buttonRect.bottom + spacing;

    const rawLeft = buttonRect.left;

    const maxLeft = window.innerWidth - calendarRect.width - spacing;
    const maxTop = window.innerHeight - calendarRect.height - spacing;

    setCalendarCoords({
      top: clamp(rawTop, spacing, maxTop),
      left: clamp(rawLeft, spacing, maxLeft),
    });
  }, [open, month]);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideButton = containerRef.current?.contains(target);
      const clickedInsideCalendar = calendarRef.current?.contains(target);

      if (!clickedInsideButton && !clickedInsideCalendar) {
        setOpen(false);
      }
    };

    const handleWindowChange = () => {
      setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [open]);

  const calendar = open
    ? createPortal(
        <div
          ref={calendarRef}
          className="fixed z-100 w-auto overflow-hidden rounded-lg 
            border border-zinc-700 bg-zinc-900 p-3 shadow-lg"
          style={{
            top: calendarCoords.top,
            left: calendarCoords.left,
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <header className="mb-2 flex items-center gap-2 text-text">
            <button
              type="button"
              title="Ano anterior"
              aria-label="Ano anterior"
              className="rounded-md p-1 hover:text-accent hover:bg-zinc-800 transition"
              onClick={() => setMonth((current) => changeYear(current, -1))}
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              type="button"
              title="Mês anterior"
              aria-label="Mês anterior"
              className="rounded-md p-1 hover:text-accent hover:bg-zinc-800 transition"
              onClick={() => setMonth((current) => changeMonth(current, -1))}
            >
              <ChevronLeft size={18} />
            </button>

            <strong className="min-w-32 flex-1 text-center font-semibold text-primary">
              {monthLabel}
            </strong>

            <button
              type="button"
              title="Próximo mês"
              aria-label="Próximo mês"
              className="rounded-md p-1 hover:text-accent hover:bg-zinc-800 transition"
              onClick={() => setMonth((current) => changeMonth(current, 1))}
            >
              <ChevronRight size={18} />
            </button>

            <button
              type="button"
              title="Próximo ano"
              aria-label="Próximo ano"
              className="rounded-md p-1 hover:text-accent hover:bg-zinc-800 transition"
              onClick={() => setMonth((current) => changeYear(current, 1))}
            >
              <ChevronsRight size={18} />
            </button>
          </header>

          <DayPicker
            mode="single"
            locale={ptBR}
            weekStartsOn={0}
            month={month}
            selected={selectedDate}
            onMonthChange={setMonth}
            onSelect={handleSelect}
            hideNavigation
            className="text-text tofocous-day-picker"
          />
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div ref={containerRef} className="relative inline-block">
        <button
          type="button"
          title={title}
          aria-required={required}
          aria-invalid={isInvalid}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((prev) => !prev);
          }}
          onBlur={onBlur}
          className={`
            flex items-center gap-2 rounded-sm border bg-zinc-800 px-2 py-1
            text-sm text-text duration-300 hover:bg-zinc-700
            focus:border-accent focus:bg-zinc-900
            ${isInvalid ? "border-red-500" : "border-zinc-700"}
          `}
        >
          {Icon && <Icon size={16} />}

          <span className="whitespace-nowrap">
            {value ? formatDisplayDate(value) : placeholder}
          </span>
        </button>
      </div>

      {calendar}
    </>
  );
};

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import type { LucideIcon } from "lucide-react";

import "react-day-picker/dist/style.css";

type DatePickerProps = {
  value?: string | null;
  onChange: (date: string | null) => void;
  onBlur?: () => void;
  placeholder?: string;
  title: string;
  icon: LucideIcon;
};

type CalendarCoords = {
  top: number;
  left: number;
  maxHeight: number;
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

const clamp = (value: number, min: number, max: number) => {
  return Math.min(Math.max(value, min), max);
};

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Selecionar data",
  title = "",
  icon: Icon,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const [calendarCoords, setCalendarCoords] = useState<CalendarCoords>({
    top: 0,
    left: 0,
    maxHeight: 320,
  });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);

  const selectedDate = parseLocalDate(value);

  const handleSelect = (date?: Date) => {
    if (!date) {
      onChange(null);
      return;
    }

    const formatted = formatDateToKey(date);

    onChange(formatted);
    setOpen(false);
  };

  const formatDisplayDate = (date?: string | null) => {
    if (!date) return null;

    const [year, month, day] = date.split("-");
    return `${day} / ${month} / ${year}`;
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

    const availableHeight = shouldOpenTop ? availableTop : availableBottom;
    const finalHeight = Math.min(calendarRect.height, availableHeight);

    const rawTop = shouldOpenTop
      ? buttonRect.top - finalHeight - spacing
      : buttonRect.bottom + spacing;

    const rawLeft = buttonRect.left;

    const maxLeft = window.innerWidth - calendarRect.width - spacing;

    setCalendarCoords({
      top: rawTop,
      left: clamp(rawLeft, spacing, maxLeft),
      maxHeight: Math.max(finalHeight, 220),
    });
  }, [open]);

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
          className="
  fixed z-100 w-max max-w-[calc(100vw-1.5rem)]
  overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 p-2
  shadow-lg
"
          style={{
            top: calendarCoords.top,
            left: calendarCoords.left,
            maxHeight: calendarCoords.maxHeight,
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
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
          onClick={(event) => {
            event.stopPropagation();
            setOpen((prev) => !prev);
          }}
          className="
            flex items-center gap-2 rounded-sm border bg-zinc-800 px-2 py-1
            text-sm text-text duration-300 hover:bg-zinc-700
            focus:border-accent focus:bg-zinc-900
          "
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

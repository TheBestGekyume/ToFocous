import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import type { LucideIcon } from "lucide-react";
import "react-day-picker/dist/style.css";

type DatePickerProps = {
  value?: string | null;
  onChange: (date: string | null) => void;
  placeholder?: string;
  title: string;
  icon: LucideIcon;
};

export const DatePicker = ({
  value,
  onChange,
  placeholder = "Selecionar data",
  title = "",
  icon: Icon,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedDate = value ? new Date(value) : undefined;

  const handleSelect = (date?: Date) => {
    if (!date) {
      onChange(null);
      return;
    }

    const formatted = date.toLocaleDateString("en-CA");
    onChange(formatted);
    setOpen(false);
  };

  const formatDisplayDate = (date?: string | null) => {
    if (!date) return null;

    const [year, month, day] = date.split("-");
    return `${day} / ${month} / ${year}`;
  };

  // ✅ click outside correto
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current) return;

      if (!containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        title={title}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="flex items-center gap-2 text-sm text-text px-2 py-1 rounded-sm border
        bg-zinc-800 hover:bg-zinc-700 duration-300 focus:border-accent focus:bg-zinc-900"
      >
        {Icon && <Icon size={16} className="text-text" />}
        <span>{value ? formatDisplayDate(value) : placeholder}</span>
      </button>

      {/* Calendar */}
      {open && (
        <div className="absolute z-50 mt-2 bg-zinc-900 p-3 rounded-lg shadow-lg border border-zinc-700">
          <DayPicker
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            className="text-text"
          />
        </div>
      )}
    </div>
  );
};

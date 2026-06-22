import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";

type TimeInputProps = {
  value?: string | null;
  onChange: (time: string | null) => void;
  title: string;
  placeholder?: string;
  icon: LucideIcon;
};

const formatTimeToHHMM = (time?: string | null): string => {
  if (!time) return "";

  return time.slice(0, 5);
};

export const TimeInput = ({
  value,
  onChange,
  title,
  placeholder = "hh:mm",
  icon: Icon,
}: TimeInputProps) => {
  const [internalValue, setInternalValue] = useState<string>("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInternalValue(formatTimeToHHMM(value));
  }, [value]);

  const isEmpty = !internalValue;
  const inputType = !isFocused && isEmpty ? "text" : "time";

  return (
    <div
      className="flex items-center gap-2 text-sm text-text px-2 py-1 rounded-sm border
      bg-zinc-800 hover:bg-zinc-700 duration-300 
      focus-within:border-accent focus-within:bg-zinc-900"
      title={title}
    >
      <Icon size={16} />

      <input
        type={inputType}
        step={60}
        value={internalValue}
        placeholder={inputType === "text" ? placeholder : undefined}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          setIsFocused(false);

          const formattedTime = formatTimeToHHMM(e.target.value);

          setInternalValue(formattedTime);
          onChange(formattedTime || null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }

          if (e.key === "Escape") {
            setInternalValue(formatTimeToHHMM(value));
            e.currentTarget.blur();
          }
        }}
        onChange={(e) => {
          setInternalValue(formatTimeToHHMM(e.target.value));
        }}
        className="bg-transparent outline-none text-center appearance-none"
      />
    </div>
  );
};
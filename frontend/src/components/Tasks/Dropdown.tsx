import { useEffect, useRef, useState } from "react";

type Option<T> = {
  value: T;
  label: string;
  icon?: React.ReactNode;
};

type DropdownProps<T> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  buttonClass?: string;
  menuClass?: string;
  renderLabel?: (value: T) => string;
};

export function Dropdown<T>({
  value,
  options,
  onChange,
  buttonClass,
  menuClass,
  renderLabel,
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-2 ${buttonClass}`}
      >
        {selected?.icon}

        {renderLabel
          ? renderLabel(value)
          : selected?.label}
      </button>

      {open && (
        <div
          className={`absolute right-0 mt-1 bg-zinc-900 border border-zinc-700 rounded-md shadow-lg overflow-hidden z-10 ${menuClass}`}
        >
          {options.map((option) => (
            <button
              key={String(option.value)}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 hover:bg-zinc-800 w-full text-left"
            >
              {option.icon}
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
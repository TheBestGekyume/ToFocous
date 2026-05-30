import { useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { Dropdown } from "../_Common/Dropdown";
import { useTasks } from "../../hooks/useTasks";
import type { SortType } from "../../types/TTask";

type SortOptionValue =
  | "date-desc"
  | "date-asc"
  | "priority-desc"
  | "priority-asc"
  | "status-desc"
  | "status-asc";

type SortOption = {
  value: SortOptionValue;
  label: string;
};

const sortOptions: SortOption[] = [
  {
    value: "date-asc",
    label: "menor prazo",
  },
  {
    value: "date-desc",
    label: "maior prazo",
  },
  {
    value: "priority-desc",
    label: "menos importantes",
  },
  {
    value: "priority-asc",
    label: "mais importantes",
  },
  {
    value: "status-asc",
    label: "pendentes primeiro",
  },
  {
    value: "status-desc",
    label: "concluídas primeiro",
  },
];

const sortOptionMap: Record<
  SortOptionValue,
  {
    type: SortType;
    isAscending: boolean;
  }
> = {
  "date-desc": {
    type: "date",
    isAscending: false,
  },
  "date-asc": {
    type: "date",
    isAscending: true,
  },
  "priority-desc": {
    type: "priority",
    isAscending: false,
  },
  "priority-asc": {
    type: "priority",
    isAscending: true,
  },
  "status-desc": {
    type: "status",
    isAscending: false,
  },
  "status-asc": {
    type: "status",
    isAscending: true,
  },
};

export const SortTasks = () => {
  const { handleSortConfig, sortConfig } = useTasks();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownWrapperRef = useRef<HTMLDivElement>(null);

  const selectedValue = `${sortConfig.type}-${
    sortConfig.isAscending ? "asc" : "desc"
  }` as SortOptionValue;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownWrapperRef.current &&
        !dropdownWrapperRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (value: SortOptionValue) => {
    const selectedSort = sortOptionMap[value];

    handleSortConfig(selectedSort.type, selectedSort.isAscending);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <h5 className="text-md text-zinc-200">Ordenar por</h5>

      <div
        ref={dropdownWrapperRef}
        className="relative"
        onClickCapture={(event) => {
          const target = event.target as HTMLElement;
          const clickedButton = target.closest("button");

          if (!clickedButton) return;

          const isTriggerButton =
            clickedButton.parentElement === dropdownWrapperRef.current?.firstElementChild;

          if (isTriggerButton) {
            setIsDropdownOpen((prev) => !prev);
          }
        }}
      >
        <Dropdown<SortOptionValue>
          value={selectedValue}
          options={sortOptions}
          onChange={handleChange}
          buttonClass="
            bg-transparent rounded-md font-medium text-text px-1 py-0.5 pr-7
            duration-200 hover:text-accent focus:text-accent focus:font-bold hover:bg-primary/10 focus:bg-black outline-none
          "
          menuClass="min-w-full bg-primary"
        />

        <span className="pointer-events-none absolute right-1.5 top-4 -translate-y-1/2">
          {isDropdownOpen ? (
            <ChevronUp className="text-accent" size={18} />
          ) : (
            <ChevronDown className="text-white" size={18} />
          )}
        </span>
      </div>
    </div>
  );
};
import { useTasks } from "../../hooks/useTasks";
import type { SortType } from "../../types/TTask";

type SortOptionValue =
  | "date-desc"
  | "date-asc"
  | "priority-desc"
  | "priority-asc"
  | "status-desc"
  | "status-asc";

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

  const selectedValue = `${sortConfig.type}-${
    sortConfig.isAscending ? "asc" : "desc"
  }` as SortOptionValue;

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as SortOptionValue;
    const selectedSort = sortOptionMap[value];

    handleSortConfig(selectedSort.type, selectedSort.isAscending);
  };

  return (
    <div className="flex items-center gap-2">
      <h5 className="text-md text-zinc-200">Ordenar por</h5>

      <select
        value={selectedValue}
        onChange={handleChange}
        className="p-1 border border-slate-500 bg-slate-600 rounded-md duration-200 hover:bg-accent/80 focus:bg-accent/80 outline-none"
      >
        <option value="date-asc">menor prazo</option>
        <option value="date-desc">maior prazo</option>
        <option value="priority-desc">menos importantes</option>
        <option value="priority-asc">mais importantes</option>
        <option value="status-asc">pendentes primeiro</option>
        <option value="status-desc">concluídas primeiro</option>
      </select>
    </div>
  );
};

import { useState } from "react";
import { ArrowDownUp } from "lucide-react";
import { useTasks } from "../contexts/TasksContext";

export const SortTasks = () => {
    const { handleSortConfig, resetSort, sortConfig } = useTasks();
    const [isSorting, setIsSorting] = useState(false);

    return (
        <div className="flex flex-wrap justify-center md:justify-between gap-3 items-center">
            <button
                onClick={() => {
                    if (isSorting) {
                        resetSort();
                        setIsSorting(false);
                    } else {
                        setIsSorting(true);
                    }
                }}
                className="flex items-center gap-2 px-3 py-2 border border-slate-500 bg-slate-600 
                   rounded-md hover:bg-slate-700 duration-200 focus:bg-purple-700"
            >
                <ArrowDownUp className="size-4" />
                {isSorting ? "Remover Ordenação" : "Ordenar"}
            </button>

            {isSorting && (
                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={() =>
                            handleSortConfig(
                                "date",
                                sortConfig.type === "date" ? !sortConfig.isAscending : true
                            )
                        }
                        className={`p-2 border border-slate-500 bg-slate-600 rounded-md duration-200 ${
                            sortConfig.type === "date" ? "bg-purple-700" : "hover:bg-slate-700"
                        }`}
                    >
                        Data{" "}
                        {sortConfig.type === "date" ? (sortConfig.isAscending ? "↑" : "↓") : ""}
                    </button>

                    <button
                        onClick={() =>
                            handleSortConfig(
                                "priority",
                                sortConfig.type === "priority" ? !sortConfig.isAscending : true
                            )
                        }
                        className={`p-2 border border-slate-500 bg-slate-600 rounded-md duration-200 ${
                            sortConfig.type === "priority" ? "bg-purple-700" : "hover:bg-slate-700"
                        }`}
                    >
                        Prioridade{" "}
                        {sortConfig.type === "priority" ? (sortConfig.isAscending ? "↑" : "↓") : ""}
                    </button>

                    <button
                        onClick={() =>
                            handleSortConfig(
                                "status",
                                sortConfig.type === "status" ? !sortConfig.isAscending : true
                            )
                        }
                        className={`p-2 border border-slate-500 bg-slate-600 rounded-md duration-200 ${
                            sortConfig.type === "status" ? "bg-purple-700" : "hover:bg-slate-700"
                        }`}
                    >
                        Status{" "}
                        {sortConfig.type === "status" ? (sortConfig.isAscending ? "↑" : "↓") : ""}
                    </button>
                </div>
            )}
        </div>
    );
};

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import type { TTask } from "../types/TTask";
import { sortTaskList } from "../utils/taskUtils";

type SortType = "date" | "priority" | "status" | "";

type TasksContextType = {
    tasks: TTask[];
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
    handleSortConfig: (type: SortType, isAscending?: boolean) => void;
    resetSort: () => void;
    sortConfig: {
        type: SortType;
        isAscending: boolean;
    };
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<TTask[]>(() => {
        try {
            const storaged = localStorage.getItem("tasks");
            if (!storaged) return [];
            return JSON.parse(storaged).map((t: TTask) => ({
                ...t,
                date: new Date(t.date),
            }));
        } catch {
            return [];
        }
    });

    const [sortConfig, setSortConfig] = useState<{
        type: SortType;
        isAscending: boolean;
    }>({
        type: "",
        isAscending: true,
    });

    const sortedTasks = useMemo(() => sortTaskList(tasks, sortConfig), [tasks, sortConfig]);

    const handleSortConfig = (type: SortType, isAscending = true) => {
        if (!type) return;
        setSortConfig({
            type,
            isAscending,
        });
    };

    const resetSort = () =>
        setSortConfig({
            type: "",
            isAscending: true,
        });

    useEffect(() => localStorage.setItem("tasks", JSON.stringify(tasks)), [tasks]);

    return (
        <TasksContext.Provider
            value={{
                tasks: sortedTasks,
                setTasks,
                handleSortConfig,
                resetSort,
                sortConfig,
            }}
        >
            {children}
        </TasksContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
    const ctx = useContext(TasksContext);
    if (!ctx) throw new Error("useTasks deve ser usado dentro de um <TasksProvider>");
    return ctx;
};

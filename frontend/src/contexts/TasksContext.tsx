import { createContext, useContext, useEffect, useState } from "react";
import type { TTask } from "../types/TTask";

type SortType = "date" | "priority" | "status" | "";

type TasksContextType = {
    tasks: TTask[];
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
    sortTasks: (type: SortType, isAscending?: boolean) => void;
    resetSort: () => void;
    sortConfig: { type: SortType; isAscending: boolean };
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
    const [tasks, setTasks] = useState<TTask[]>(() => {
        try {
            const storagedTasks = localStorage.getItem("tasks");
            if (!storagedTasks) return [];
            return JSON.parse(storagedTasks).map((task: TTask) => ({
                ...task,
                date: new Date(task.date),
            }));
        } catch {
            console.error("Erro ao recuperar as tarefas do localStorage!");
            return [];
        }
    });

    const [originalTasks, setOriginalTasks] = useState<TTask[] | null>(null);
    const [sortConfig, setSortConfig] = useState<{
        type: SortType;
        isAscending: boolean;
    }>({
        type: "",
        isAscending: true,
    });

    const priorityOrder: Record<"high" | "medium" | "low", number> = {
        high: 1,
        medium: 2,
        low: 3,
    };

    const statusOrder: Record<
        "not_started" | "in_progress" | "concluded",
        number
    > = {
        not_started: 1,
        in_progress: 2,
        concluded: 3,
    };

    const sortTasks = (type: SortType, isAscending = true) => {
        if (!type) return;

        if (!originalTasks) setOriginalTasks(tasks);

        const sorted = [...tasks].sort((a, b) => {
            switch (type) {
                case "date":
                    return isAscending
                        ? new Date(a.date).getTime() -
                              new Date(b.date).getTime()
                        : new Date(b.date).getTime() -
                              new Date(a.date).getTime();

                case "priority":
                    return isAscending
                        ? priorityOrder[a.priority] - priorityOrder[b.priority]
                        : priorityOrder[b.priority] - priorityOrder[a.priority];

                case "status":
                    return isAscending
                        ? statusOrder[a.status] - statusOrder[b.status]
                        : statusOrder[b.status] - statusOrder[a.status];

                default:
                    return 0;
            }
        });

        setTasks(sorted);
        setSortConfig({ type, isAscending });
    };

    const resetSort = () => {
        if (originalTasks) {
            setTasks(originalTasks);
            setOriginalTasks(null);
        }
        setSortConfig({ type: "", isAscending: true });
    };

    useEffect(() => {
        if (sortConfig.type) {
            const sorted = [...tasks].sort((a, b) => {
                switch (sortConfig.type) {
                    case "date":
                        return sortConfig.isAscending
                            ? new Date(a.date).getTime() -
                                  new Date(b.date).getTime()
                            : new Date(b.date).getTime() -
                                  new Date(a.date).getTime();
                    case "priority":
                        return sortConfig.isAscending
                            ? priorityOrder[a.priority] -
                                  priorityOrder[b.priority]
                            : priorityOrder[b.priority] -
                                  priorityOrder[a.priority];
                    case "status":
                        return sortConfig.isAscending
                            ? statusOrder[a.status] - statusOrder[b.status]
                            : statusOrder[b.status] - statusOrder[a.status];
                    default:
                        return 0;
                }
            });

            const hasChanged = JSON.stringify(sorted) !== JSON.stringify(tasks);
            if (hasChanged) {
                setTasks(sorted);
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks, sortConfig]);

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    return (
        <TasksContext.Provider
            value={{
                tasks,
                setTasks,
                sortTasks,
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
    const context = useContext(TasksContext);
    if (!context)
        throw new Error("useTasks deve ser usado dentro de um <TasksProvider>");
    return context;
};

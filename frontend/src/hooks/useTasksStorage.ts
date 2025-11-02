import { useEffect, useState } from "react";
import type { TTask } from "../types/TTask";

export const useTasksStorage = () => {
    const [tasks, setTasks] = useState<TTask[]>(() => {
        try {
            const saved = localStorage.getItem("tasks");
            if (!saved) return [];
            return JSON.parse(saved).map((task: TTask) => ({
                ...task,
                date: new Date(task.date),
            }));
        } catch {
            console.error("Erro ao recuperar as tarefas do localStorage!");
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    return { tasks, setTasks };
};

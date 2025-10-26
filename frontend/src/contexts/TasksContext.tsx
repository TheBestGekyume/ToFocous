import { createContext, useContext, useEffect, useState } from "react";
import type { TTask } from "../types/TTask";

type TasksContextType = {
  tasks: TTask[];
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
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

  return (
    <TasksContext.Provider value={{ tasks, setTasks }}>
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

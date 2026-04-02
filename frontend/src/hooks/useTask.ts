import { useContext } from "react";
import { TasksContext } from "../contexts/TasksContext";

export const useTasks = () => {
  const ctx = useContext(TasksContext);

  if (!ctx) {
    throw new Error("useTasks deve ser usado dentro de um <TasksProvider>");
  }

  return ctx;
};
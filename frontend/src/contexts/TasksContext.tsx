import { createContext } from "react";
import type {
  TTask,
  TSubTask,
  TCreateTaskDTO,
  TCreateSubTaskDTO,
} from "../types/TTask";

export type SortType = "date" | "priority" | "status" | "";

export type TasksContextType = {
  tasks: TTask[];
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;

  handleSortConfig: (type: SortType, isAscending?: boolean) => void;
  resetSort: () => void;

  sortConfig: {
    type: SortType;
    isAscending: boolean;
  };

  /* TASK */
  createTask: (data: TCreateTaskDTO) => Promise<void>;
  updateTask: (id: string, data: Partial<TTask>) => Promise<TTask | undefined>;
  deleteTask: (id: string) => Promise<void>;

  /* SUBTASK */
  getSubTasks: (taskId: string) => Promise<void>;
  createSubTask: (taskId: string, data: TCreateSubTaskDTO) => Promise<void>;
  updateSubTask: (
    taskId: string,
    subtaskId: string,
    data: Partial<TSubTask>
  ) => Promise<void>;
  deleteSubTask: (taskId: string, subtaskId: string) => Promise<void>;
};

export const TasksContext = createContext<TasksContextType | undefined>(
  undefined
);

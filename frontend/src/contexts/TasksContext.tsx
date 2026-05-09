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
  loading: boolean;

  sortConfig: {
    type: SortType;
    isAscending: boolean;
  };

  /* TASK */
  getTasks: () => Promise<void>;
  getTasksByProject: (projectId: string) => Promise<void>;
  createTask: (payload: TCreateTaskDTO) => Promise<TTask>;
  updateTask: (taskId: string, payload: Partial<TTask>) => Promise<TTask>;
  deleteTask: (taskId: string) => Promise<void>;

  /* SUBTASK */
  getSubTasks: (taskId: string) => Promise<TSubTask[]>;
  createSubTask: (
    taskId: string,
    payload: TCreateSubTaskDTO
  ) => Promise<TSubTask>;
  updateSubTask: (
    taskId: string,
    subtaskId: string,
    payload: Partial<TSubTask>
  ) => Promise<TSubTask>;
  deleteSubTask: (taskId: string, subtaskId: string) => Promise<void>;
};

export const TasksContext = createContext<TasksContextType | null>(null);

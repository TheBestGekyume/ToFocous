import { createContext } from "react";
import type {
  TTask,
  TSubTask,
  TCreateTaskDTO,
  TCreateSubTaskDTO,
  SortType,
} from "../types/TTask";
import type { TTaskAssignment } from "../types/TTaskAssignment";

export type TasksContextType = {
  tasks: TTask[];
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;

  handleSortConfig: (type: SortType, isAscending?: boolean) => void;
  resetSort: () => void;
  loading: boolean;

  assignments: TTaskAssignment[];
  getProjectAssignments: (projectId: string) => Promise<TTaskAssignment[]>;
  assignUserToTask: (
    taskId: string,
    assignedUserId: string
  ) => Promise<TTaskAssignment>;
  assignUserToSubTask: (
    subtaskId: string,
    assignedUserId: string
  ) => Promise<TTaskAssignment>;
  removeTaskAssignment: (assignmentId: string) => Promise<void>;

  sortConfig: {
    type: SortType;
    isAscending: boolean;
  };

  /* TASK */
  getTasks: () => Promise<TTask[]>;
  getTasksByProject: (projectId: string) => Promise<TTask[]>;
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
  subscribeToProjectRealtime: (projectId: string) => () => void;
};

export const TasksContext = createContext<TasksContextType | null>(null);

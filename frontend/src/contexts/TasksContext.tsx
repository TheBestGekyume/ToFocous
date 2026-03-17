import { createContext, useContext, useState, useMemo, useEffect } from "react";
import type {
  TCreateSubtaskDTO,
  TCreateTaskDTO,
  TSubTask,
  TTask,
} from "../types/TTask";
import { sortTaskList } from "../utils/taskUtils";
import { taskService } from "../services/taskService";
import { useCallback } from "react";

type SortType = "date" | "priority" | "status" | "";

type TasksContextType = {
  tasks: TTask[];
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
  selectedTask: TTask | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<TTask | null>>;
  handleSortConfig: (type: SortType, isAscending?: boolean) => void;
  resetSort: () => void;
  sortConfig: {
    type: SortType;
    isAscending: boolean;
  };
  toggleSubtaskStatus: (taskId: string, subtaskId: string) => void;
  createTask: (data: TCreateTaskDTO) => Promise<void>;
  updateTask: (id: string, data: Partial<TTask>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getSubtTasks: (taskId: string) => Promise<void>;
  createSubtask: (taskId: string, data: TCreateSubtaskDTO) => Promise<void>;
  updateSubtask: (
    taskId: string,
    subtaskId: string,
    data: Partial<TSubTask>
  ) => Promise<void>;
  deleteSubtask: (taskId: string, subtaskId: string) => Promise<void>;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  // console.log("Tasks:", tasks);

  const [selectedTask, setSelectedTask] = useState<TTask | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    type: SortType;
    isAscending: boolean;
  }>({
    type: "",
    isAscending: true,
  });

  const sortedTasks = useMemo(() => {
    if (!sortConfig.type) return tasks;
    return sortTaskList(tasks, sortConfig);
  }, [tasks, sortConfig]);

  const handleSortConfig = useCallback((type: SortType, isAscending = true) => {
    if (!type) return;
    setSortConfig({ type, isAscending });
  }, []);

  const resetSort = useCallback(() => {
    setSortConfig({
      type: "",
      isAscending: true,
    });
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await taskService.getTasks();
        setTasks(data);
      } catch (err) {
        console.error("Erro ao carregar tarefas", err);
      }
    };

    loadTasks();
  }, []);

  const toggleSubtaskStatus = useCallback(
    (taskId: string, subtaskId: string) => {
      setTasks((prev) => {
        const newTasks = prev.map((task) =>
          task.id === taskId
            ? {
                ...task,
                subtasks: task.subtasks.map((subtask) =>
                  subtask.id === subtaskId
                    ? {
                        ...subtask,
                        status:
                          subtask.status === "concluded"
                            ? ("unstarted" as const)
                            : ("concluded" as const),
                      }
                    : subtask
                ),
              }
            : task
        );

        if (selectedTask?.id === taskId) {
          const updated = newTasks.find((t) => t.id === taskId);
          setSelectedTask(updated || null);
        }

        return newTasks;
      });
    },
    [selectedTask]
  );

  /*CRUD - TASK */

  const createTask = useCallback(async (payload: TCreateTaskDTO) => {
    try {
      const created = await taskService.createTask(payload);
      setTasks((prev) => [created, ...prev]);
    } catch (err) {
      console.error("Erro ao criar task", err);
    }
  }, []);

  const updateTask = useCallback(
    async (taskId: string, payload: Partial<TTask>) => {
      try {
        const updated = await taskService.updateTask(taskId, payload);

        setTasks((prev) =>
          prev.map((t) => (t.id === updated.id ? updated : t))
        );
      } catch (err) {
        console.error("Erro ao atualizar task", err);
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);

      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      console.error("Erro ao deletar task", err);
    }
  }, []);

  //CRUD - SUBTASK

  const getSubtTasks = useCallback(async (taskId: string) => {
    const subtasks = await taskService.getSubtasks(taskId);

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks } : t))
    );
  }, []);

  const createSubtask = useCallback(
    async (taskId: string, payload: TCreateSubtaskDTO) => {
      try {
        const created = await taskService.createSubtask(taskId, payload);

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...(task.subtasks ?? []), created],
                }
              : task
          )
        );
      } catch (err) {
        console.error("Erro ao criar subtask", err);
      }
    },
    []
  );

  const updateSubtask = useCallback(
    async (taskId: string, subtaskId: string, payload: Partial<TSubTask>) => {
      try {
        const updated = await taskService.updateSubtask(
          subtaskId,
          taskId,
          payload
        );

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((st) =>
                    st.id === updated.id ? updated : st
                  ),
                }
              : task
          )
        );
      } catch (err) {
        console.error("Erro ao atualizar subtask", err);
      }
    },
    []
  );

  const deleteSubtask = useCallback(
    async (taskId: string, subtaskId: string) => {
      try {
        await taskService.deleteSubtask(subtaskId, taskId);

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
                }
              : task
          )
        );
      } catch (err) {
        console.error("Erro ao deletar subtask", err);
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      tasks: sortedTasks,
      setTasks,
      selectedTask,
      setSelectedTask,
      handleSortConfig,
      resetSort,
      sortConfig,
      toggleSubtaskStatus,
      createTask,
      updateTask,
      deleteTask,
      createSubtask,
      updateSubtask,
      deleteSubtask,
      getSubtTasks,
    }),
    [
      sortedTasks,
      selectedTask,
      sortConfig,
      handleSortConfig,
      resetSort,
      toggleSubtaskStatus,
      createTask,
      updateTask,
      deleteTask,
      createSubtask,
      updateSubtask,
      deleteSubtask,
      getSubtTasks,
    ]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx)
    throw new Error("useTasks deve ser usado dentro de um <TasksProvider>");
  return ctx;
};

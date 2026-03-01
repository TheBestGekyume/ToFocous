import { createContext, useContext, useState, useMemo, useEffect } from "react";
import type { /*TSubTask,*/ TTask } from "../types/TTask";
import { sortTaskList } from "../utils/taskUtils";
import { taskService } from "../services/taskService";

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
  deleteSubtask: (taskId: string, subtaskId: string) => void;
};

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TTask[]>([]);
   

  const [selectedTask, setSelectedTask] = useState<TTask | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    type: SortType;
    isAscending: boolean;
  }>({
    type: "",
    isAscending: true,
  });

  const sortedTasks = useMemo(
    () => sortTaskList(tasks, sortConfig),
    [tasks, sortConfig]
  );

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

  // useEffect(
  //   () => localStorage.setItem("tasks", JSON.stringify(tasks)),
  //   [tasks]
  // );

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

  // dentro do TasksContext

  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
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

      // atualiza o selectedTask também
      if (selectedTask?.id === taskId) {
        const updated = newTasks.find((t) => t.id === taskId);
        setSelectedTask(updated || null);
      }

      return newTasks;
    });
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) => {
      const newTasks = prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.filter((st) => st.id !== subtaskId),
            }
          : task
      );

      if (selectedTask?.id === taskId) {
        const updated = newTasks.find((t) => t.id === taskId);
        setSelectedTask(updated || null);
      }

      return newTasks;
    });
  };

  return (
    <TasksContext.Provider
      value={{
        tasks: sortedTasks,
        setTasks,
        selectedTask,
        setSelectedTask,
        handleSortConfig,
        resetSort,
        sortConfig,
        toggleSubtaskStatus,
        deleteSubtask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx)
    throw new Error("useTasks deve ser usado dentro de um <TasksProvider>");
  return ctx;
};

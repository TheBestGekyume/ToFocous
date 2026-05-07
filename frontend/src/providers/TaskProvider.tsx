import { useState, useMemo, useCallback } from "react";
import { TasksContext, type SortType } from "../contexts/TasksContext";
import { taskService } from "../services/taskService";
import { sortTaskList } from "../utils/taskUtils";
import type {
  TCreateSubTaskDTO,
  TCreateTaskDTO,
  TSubTask,
  TTask,
} from "../types/TTask";

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [loading, setLoading] = useState(false);

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

  const getTasks = useCallback(async () => {
    try {
      setLoading(true);

      const data = await taskService.getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Erro ao buscar tasks do usuário", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasksByProject = useCallback(async (projectId: string) => {
    try {
      setLoading(true);

      const data = await taskService.getTasksByProject(projectId);
      setTasks(data);
    } catch (err) {
      console.error(`Erro ao buscar task no projeto ${projectId}:`, err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTask = useCallback(async (payload: TCreateTaskDTO) => {
    try {
      const created = await taskService.createTask(payload);
      setTasks((prev) => [created, ...prev]);

      return created;
    } catch (err) {
      console.error("Erro ao criar task", err);
      throw err;
    }
  }, []);

  const updateTask = useCallback(
    async (taskId: string, payload: Partial<TTask>) => {
      try {
        const updated = await taskService.updateTask(taskId, payload);

        setTasks((prev) =>
          prev.map((task) =>
            task.id === updated.id ? { ...task, ...updated } : task
          )
        );

        return updated;
      } catch (err) {
        console.error("Erro ao atualizar task", err);
        throw err;
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (err) {
      console.error("Erro ao deletar task", err);
      throw err;
    }
  }, []);

  const getSubTasks = useCallback(async (taskId: string) => {
    try {
      const subtasks = await taskService.getSubTasks(taskId);

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, subtasks } : task))
      );

      return subtasks;
    } catch (err) {
      console.error("Erro ao buscar subtasks", err);
      throw err;
    }
  }, []);

  const createSubTask = useCallback(
    async (taskId: string, payload: TCreateSubTaskDTO) => {
      try {
        const created = await taskService.createSubTask(taskId, payload);

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

        return created;
      } catch (err) {
        console.error("Erro ao criar subtask", err);
        throw err;
      }
    },
    []
  );

  const updateSubTask = useCallback(
    async (taskId: string, subtaskId: string, payload: Partial<TSubTask>) => {
      try {
        const updated = await taskService.updateSubTask(
          subtaskId,
          taskId,
          payload
        );

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: (task.subtasks ?? []).map((subtask) =>
                    subtask.id === updated.id
                      ? { ...subtask, ...updated }
                      : subtask
                  ),
                }
              : task
          )
        );

        return updated;
      } catch (err) {
        console.error("Erro ao atualizar subtask", err);
        throw err;
      }
    },
    []
  );

  const deleteSubTask = useCallback(
    async (taskId: string, subtaskId: string) => {
      try {
        await taskService.deleteSubTask(subtaskId, taskId);

        setTasks((prev) =>
          prev.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: (task.subtasks ?? []).filter(
                    (subtask) => subtask.id !== subtaskId
                  ),
                }
              : task
          )
        );
      } catch (err) {
        console.error("Erro ao deletar subtask", err);
        throw err;
      }
    },
    []
  );

  const value = useMemo(
    () => ({
      tasks: sortedTasks,
      setTasks,

      loading,

      sortConfig,
      handleSortConfig,
      resetSort,

      getTasks,
      getTasksByProject,
      createTask,
      updateTask,
      deleteTask,

      getSubTasks,
      createSubTask,
      updateSubTask,
      deleteSubTask,
    }),
    [
      sortedTasks,
      loading,
      sortConfig,
      handleSortConfig,
      resetSort,
      getTasks,
      getTasksByProject,
      createTask,
      updateTask,
      deleteTask,
      getSubTasks,
      createSubTask,
      updateSubTask,
      deleteSubTask,
    ]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};
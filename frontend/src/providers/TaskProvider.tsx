import { useState, useMemo, useCallback, useRef } from "react";
import { TasksContext } from "../contexts/TasksContext";
import { taskService } from "../services/taskService";
import { sortTaskList } from "../utils/taskUtils";
import type {
  SortType,
  TCreateSubTaskDTO,
  TCreateTaskDTO,
  TSubTask,
  TTask,
} from "../types/TTask";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { supabaseRealtimeClient } from "../services/supabaseRealtimeClient";
import { getAccessToken } from "../utils/tokenUtils";
import axios from "axios";

type TaskRealtimePayload = RealtimePostgresChangesPayload<TTask>;
type SubTaskRealtimePayload = RealtimePostgresChangesPayload<TSubTask>;

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [loading, setLoading] = useState(false);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    type: SortType;
    isAscending: boolean;
  }>({
    type: "date",
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

  const getTasks = useCallback(async (): Promise<TTask[]> => {
    try {
      setLoading(true);

      const data = await taskService.getTasks();
      setTasks(data);

      return data;
    } catch (err) {
      console.error("Erro ao buscar tasks do usuário", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasksByProject = useCallback(
    async (projectId: string): Promise<TTask[]> => {
      try {
        setLoading(true);

        const data = await taskService.getTasksByProject(projectId);
        setTasks(data);

        return data;
      } catch (err) {
        console.error(`Erro ao buscar task no projeto ${projectId}:`, err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
    const isCanceledRequest =
      axios.isCancel(err) ||
      (axios.isAxiosError(err) && err.code === "ERR_CANCELED");

    if (isCanceledRequest) {
      return [];
    }

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

  const upsertTaskFromRealtime = useCallback((incomingTask: TTask) => {
    setTasks((prev) => {
      const alreadyExists = prev.some((task) => task.id === incomingTask.id);

      if (!alreadyExists) {
        return [
          { ...incomingTask, subtasks: incomingTask.subtasks ?? [] },
          ...prev,
        ];
      }

      return prev.map((task) =>
        task.id === incomingTask.id
          ? {
              ...task,
              ...incomingTask,
              subtasks: task.subtasks ?? incomingTask.subtasks ?? [],
            }
          : task
      );
    });
  }, []);

  const removeTaskFromRealtime = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  const upsertSubTaskFromRealtime = useCallback((incomingSubTask: TSubTask) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== incomingSubTask.task_id) return task;

        const currentSubTasks = task.subtasks ?? [];
        const alreadyExists = currentSubTasks.some(
          (subtask) => subtask.id === incomingSubTask.id
        );

        if (!alreadyExists) {
          return {
            ...task,
            subtasks: [...currentSubTasks, incomingSubTask],
          };
        }

        return {
          ...task,
          subtasks: currentSubTasks.map((subtask) =>
            subtask.id === incomingSubTask.id
              ? { ...subtask, ...incomingSubTask }
              : subtask
          ),
        };
      })
    );
  }, []);

  const removeSubTaskFromRealtime = useCallback((subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => ({
        ...task,
        subtasks: (task.subtasks ?? []).filter(
          (subtask) => subtask.id !== subtaskId
        ),
      }))
    );
  }, []);

  const subscribeToProjectRealtime = useCallback(
  (projectId: string) => {
        // console.log("[TaskProvider] subscribeToProjectRealtime chamado:", projectId);
    const token = getAccessToken();

    // console.log("[Realtime] iniciando subscribe do projeto:", projectId);
    // console.log("[Realtime] token existe?", Boolean(token));

    if (token) {
      supabaseRealtimeClient.realtime.setAuth(token);
    }

    if (realtimeChannelRef.current) {
      // console.log("[Realtime] removendo canal anterior");
      supabaseRealtimeClient.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }

    const channel = supabaseRealtimeClient
      .channel(`project-realtime-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        (payload: TaskRealtimePayload) => {
          // console.log("[Realtime] evento em tasks:", payload);

          if (payload.eventType === "DELETE") {
            const deletedTaskId = payload.old.id;

            if (deletedTaskId) {
              removeTaskFromRealtime(deletedTaskId);
            }

            return;
          }

          upsertTaskFromRealtime(payload.new);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subtasks",
        },
        (payload: SubTaskRealtimePayload) => {
          // console.log("[Realtime] evento em subtasks:", payload);

          if (payload.eventType === "DELETE") {
            const deletedSubTaskId = payload.old.id;

            if (deletedSubTaskId) {
              removeSubTaskFromRealtime(deletedSubTaskId);
            }

            return;
          }

          upsertSubTaskFromRealtime(payload.new);
        }
      )
      // .subscribe((status, err) => {
      //   console.log("[Realtime] status:", status, err);

      //   if (status === "SUBSCRIBED") {
      //     console.log("[Realtime] conectado no projeto:", projectId);
      //   }

      //   if (status === "CHANNEL_ERROR") {
      //     console.error("[Realtime] erro no canal do projeto:", projectId, err);
      //   }

      //   if (status === "TIMED_OUT") {
      //     console.error("[Realtime] timeout no canal do projeto:", projectId);
      //   }

      //   if (status === "CLOSED") {
      //     console.warn("[Realtime] canal fechado:", projectId);
      //   }
      // });

    realtimeChannelRef.current = channel;

    return () => {
      console.log("[Realtime] removendo canal do projeto:", projectId);
      supabaseRealtimeClient.removeChannel(channel);

      if (realtimeChannelRef.current === channel) {
        realtimeChannelRef.current = null;
      }
    };
  },
  [
    removeSubTaskFromRealtime,
    removeTaskFromRealtime,
    upsertSubTaskFromRealtime,
    upsertTaskFromRealtime,
  ]
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
      subscribeToProjectRealtime,
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
      subscribeToProjectRealtime,
    ]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

import { useState, useMemo, useCallback, useRef } from "react";
import { TasksContext } from "../contexts/TasksContext";
import { taskService } from "../services/tasks/taskService";
import { sortTaskList } from "../utils/taskUtils";
import type {
  SortType,
  TCreateSubTaskDTO,
  TCreateTaskDTO,
  TSubTask,
  TTask,
  TUpdateSubTaskDTO,
  TUpdateTaskDTO,
} from "../types/TTask";
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { supabaseRealtimeClient } from "../services/realtime/supabaseRealtimeClient";
import { getAccessToken } from "../utils/tokenUtils";
import { taskAssignmentService } from "../services/tasks/taskAssignmentService";
import type { TTaskAssignment } from "../types/TTaskAssignment";
import { isCanceledRequestError, logApiError } from "../utils/apiError";

type TaskRealtimePayload = RealtimePostgresChangesPayload<TTask>;
type SubTaskRealtimePayload = RealtimePostgresChangesPayload<TSubTask>;

const upsertSubTaskInTasks = (
  currentTasks: TTask[],
  taskId: string,
  incomingSubTask: TSubTask
): TTask[] =>
  currentTasks.map((task) => {
    if (task.id !== taskId) {
      return task;
    }

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
  });

export const TasksProvider = ({ children }: { children: React.ReactNode }) => {
  const [tasks, setTasks] = useState<TTask[]>([]);
  const [loading, setLoading] = useState(false);
  const realtimeChannelRef = useRef<RealtimeChannel | null>(null);

  const assignmentRefreshTimeoutRef = useRef<number | null>(null);
  const realtimeProjectIdRef = useRef<string | null>(null);

  const [assignments, setAssignments] = useState<TTaskAssignment[]>([]);

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
    } catch (error: unknown) {
      logApiError("Erro ao buscar tasks do usuário", error);
      throw error;
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
      } catch (error: unknown) {
        logApiError(`Erro ao buscar tasks no projeto ${projectId}`, error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createTask = useCallback(async (payload: TCreateTaskDTO) => {
    try {
      const created = await taskService.createTask(payload);

      setTasks((previousTasks) => {
        const alreadyExists = previousTasks.some(
          (task) => task.id === created.id
        );

        if (!alreadyExists) {
          return [
            {
              ...created,
              subtasks: created.subtasks ?? [],
            },
            ...previousTasks,
          ];
        }

        return previousTasks.map((task) =>
          task.id === created.id
            ? {
                ...task,
                ...created,
                subtasks: task.subtasks ?? created.subtasks ?? [],
              }
            : task
        );
      });

      return created;
    } catch (error: unknown) {
      logApiError("Erro ao criar task", error);
      throw error;
    }
  }, []);

  const updateTask = useCallback(
    async (taskId: string, payload: TUpdateTaskDTO) => {
      try {
        const updated = await taskService.updateTask(taskId, payload);

        setTasks((prev) =>
          prev.map((task) =>
            task.id === updated.id ? { ...task, ...updated } : task
          )
        );

        return updated;
      } catch (error: unknown) {
        logApiError("Erro ao atualizar task", error);
        throw error;
      }
    },
    []
  );

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId);

      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error: unknown) {
      logApiError("Erro ao deletar task", error);
      throw error;
    }
  }, []);

  const getSubTasks = useCallback(async (taskId: string) => {
    try {
      const subtasks = await taskService.getSubTasks(taskId);

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? { ...task, subtasks } : task))
      );

      return subtasks;
    } catch (error: unknown) {
      if (isCanceledRequestError(error)) {
        return [];
      }

      logApiError("Erro ao buscar subtasks", error);
      throw error;
    }
  }, []);

  const createSubTask = useCallback(
    async (taskId: string, payload: TCreateSubTaskDTO) => {
      try {
        const created = await taskService.createSubTask(taskId, payload);

        setTasks((previousTasks) =>
          upsertSubTaskInTasks(previousTasks, taskId, created)
        );

        return created;
      } catch (error: unknown) {
        logApiError("Erro ao criar subtask", error);
        throw error;
      }
    },
    []
  );

  const updateSubTask = useCallback(
    async (taskId: string, subtaskId: string, payload: TUpdateSubTaskDTO) => {
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
      } catch (error: unknown) {
        logApiError("Erro ao atualizar subtask", error);
        throw error;
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
      } catch (error: unknown) {
        logApiError("Erro ao deletar subtask", error);
        throw error;
      }
    },
    []
  );

  const getProjectAssignments = useCallback(
    async (projectId: string): Promise<TTaskAssignment[]> => {
      try {
        setAssignments([]);

        const data =
          await taskAssignmentService.getProjectAssignments(projectId);

        setAssignments(data);

        return data;
      } catch (error: unknown) {
        logApiError("Erro ao buscar responsáveis do projeto", error);
        throw error;
      }
    },
    []
  );

  const refreshProjectAssignmentsSilently = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        const data =
          await taskAssignmentService.getProjectAssignments(projectId);

        if (realtimeProjectIdRef.current !== projectId) {
          return;
        }

        setAssignments(data);
      } catch (error: unknown) {
        logApiError("Erro ao sincronizar responsáveis em tempo real", error);
      }
    },
    []
  );

  const scheduleProjectAssignmentsRefresh = useCallback(
    (projectId: string) => {
      if (assignmentRefreshTimeoutRef.current !== null) {
        window.clearTimeout(assignmentRefreshTimeoutRef.current);
      }

      assignmentRefreshTimeoutRef.current = window.setTimeout(() => {
        assignmentRefreshTimeoutRef.current = null;

        void refreshProjectAssignmentsSilently(projectId);
      }, 150);
    },
    [refreshProjectAssignmentsSilently]
  );

  const assignUserToTask = useCallback(
    async (taskId: string, assignedUserId: string) => {
      try {
        const created = await taskAssignmentService.createAssignment({
          task_id: taskId,
          assigned_user_id: assignedUserId,
        });

        setAssignments((prev) => {
          const alreadyExists = prev.some(
            (assignment) => assignment.id === created.id
          );

          if (alreadyExists) return prev;

          return [...prev, created];
        });

        return created;
      } catch (error: unknown) {
        logApiError("Erro ao atribuir responsável à task", error);
        throw error;
      }
    },
    []
  );

  const assignUserToSubTask = useCallback(
    async (subtaskId: string, assignedUserId: string) => {
      try {
        const created = await taskAssignmentService.createAssignment({
          subtask_id: subtaskId,
          assigned_user_id: assignedUserId,
        });

        setAssignments((prev) => {
          const alreadyExists = prev.some(
            (assignment) => assignment.id === created.id
          );

          if (alreadyExists) return prev;

          return [...prev, created];
        });

        return created;
      } catch (error: unknown) {
        logApiError("Erro ao atribuir responsável à subtask", error);
        throw error;
      }
    },
    []
  );

  const removeTaskAssignment = useCallback(async (assignmentId: string) => {
    try {
      await taskAssignmentService.deleteAssignment({
        assignment_id: assignmentId,
      });

      setAssignments((prev) =>
        prev.filter((assignment) => assignment.id !== assignmentId)
      );
    } catch (error: unknown) {
      logApiError("Erro ao remover responsável", error);
      throw error;
    }
  }, []);

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
    setTasks((previousTasks) =>
      upsertSubTaskInTasks(
        previousTasks,
        incomingSubTask.task_id,
        incomingSubTask
      )
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
      const token = getAccessToken();

      realtimeProjectIdRef.current = projectId;

      if (token) {
        supabaseRealtimeClient.realtime.setAuth(token);
      }

      if (assignmentRefreshTimeoutRef.current !== null) {
        window.clearTimeout(assignmentRefreshTimeoutRef.current);
        assignmentRefreshTimeoutRef.current = null;
      }

      if (realtimeChannelRef.current) {
        void supabaseRealtimeClient.removeChannel(realtimeChannelRef.current);

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
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "task_assignments",
          },
          () => {
            scheduleProjectAssignmentsRefresh(projectId);
          }
        )
        .subscribe((status, error) => {
          if (status === "SUBSCRIBED") {
            console.log("[Realtime] conectado no projeto:", projectId);
          }

          if (status === "CHANNEL_ERROR") {
            console.error(
              "[Realtime] erro no canal do projeto:",
              projectId,
              error
            );
          }

          if (status === "TIMED_OUT") {
            console.error("[Realtime] timeout no canal do projeto:", projectId);
          }

          if (status === "CLOSED") {
            console.log("[Realtime] canal fechado:", projectId);
          }
        });

      realtimeChannelRef.current = channel;

      return () => {
        console.log("[Realtime] removendo canal do projeto:", projectId);

        if (assignmentRefreshTimeoutRef.current !== null) {
          window.clearTimeout(assignmentRefreshTimeoutRef.current);

          assignmentRefreshTimeoutRef.current = null;
        }

        if (realtimeProjectIdRef.current === projectId) {
          realtimeProjectIdRef.current = null;
        }

        void supabaseRealtimeClient.removeChannel(channel);

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
      scheduleProjectAssignmentsRefresh,
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

      assignments,

      getProjectAssignments,
      assignUserToTask,
      assignUserToSubTask,
      removeTaskAssignment,

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
      assignments,
      getProjectAssignments,
      assignUserToTask,
      assignUserToSubTask,
      removeTaskAssignment,
      subscribeToProjectRealtime,
    ]
  );

  return (
    <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
  );
};

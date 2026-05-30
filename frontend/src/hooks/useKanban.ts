import { useCallback, useEffect, useMemo, useState } from "react";
import type { TStatus, TTask } from "../types/TTask";
import type { TProject } from "../types/TProject";
import { useProjects } from "./useProjects";
import { useTasks } from "./useTasks";

export type KanbanColumnConfig = {
  id: TStatus;
  title: string;
};

export const kanbanColumns: KanbanColumnConfig[] = [
  {
    id: "unstarted",
    title: "Não iniciadas",
  },
  {
    id: "inProgress",
    title: "Em andamento",
  },
  {
    id: "concluded",
    title: "Concluídas",
  },
];

type KanbanTasksByStatus = Record<TStatus, TTask[]>;

const createEmptyKanbanColumns = (): KanbanTasksByStatus => ({
  unstarted: [],
  inProgress: [],
  concluded: [],
});

export const isTaskStatus = (value: string): value is TStatus => {
  return kanbanColumns.some((column) => column.id === value);
};

export const useKanban = () => {
  const {
    projects,
    loading: projectsLoading,
  } = useProjects();

  const {
    tasks,
    setTasks,
    loading: tasksLoading,
    getTasksByProject,
    updateTask,
    subscribeToProjectRealtime,
  } = useTasks();

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const selectedProject = useMemo<TProject | undefined>(() => {
    return projects.find((project) => project.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  const tasksByStatus = useMemo<KanbanTasksByStatus>(() => {
    return tasks.reduce<KanbanTasksByStatus>((acc, task) => {
      acc[task.status].push(task);
      return acc;
    }, createEmptyKanbanColumns());
  }, [tasks]);


  useEffect(() => {
    if (selectedProjectId || projects.length === 0) return;

    setSelectedProjectId(projects[0].id);
  }, [projects, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;

    getTasksByProject(selectedProjectId);

    const unsubscribe = subscribeToProjectRealtime(selectedProjectId);

    return () => {
      unsubscribe?.();
    };
  }, [getTasksByProject, selectedProjectId, subscribeToProjectRealtime]);

  const updateTaskStatus = useCallback(
    async (taskId: string, newStatus: TStatus) => {
      const currentTask = tasks.find((task) => task.id === taskId);

      if (!currentTask || currentTask.status === newStatus) return;

      const previousStatus = currentTask.status;

      setUpdatingTaskId(taskId);

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );

      try {
        await updateTask(taskId, {
          status: newStatus,
        });
      } catch (err) {
        setTasks((prevTasks) =>
          prevTasks.map((task) =>
            task.id === taskId ? { ...task, status: previousStatus } : task
          )
        );

        throw err;
      } finally {
        setUpdatingTaskId(null);
      }
    },
    [setTasks, tasks, updateTask]
  );

  return {
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,

    tasks,
    tasksByStatus,
    kanbanColumns,

    loading: projectsLoading || tasksLoading,
    updatingTaskId,

    updateTaskStatus,
  };
};
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTasks } from "./useTasks";
import { useProjects } from "./useProjects";
import type { TSubTask, TTask } from "../types/TTask";
import {
  type AgendaItem,
  buildAgendaItems,
  formatDateKey,
  groupAgendaItemsByDate,
} from "../utils/agendaUtils";
import type { AgendaProjectOption } from "../components/Agenda/AgendaHeader";
import { useTaskSettings } from "./useTaskSettings";

type TTaskWithSubtasks = TTask & {
  subtasks?: TSubTask[];
};

const isSubTaskArray = (value: unknown): value is TSubTask[] => {
  return Array.isArray(value);
};

export const useAgenda = () => {
  const navigate = useNavigate();

  const {
    tasks,
    loading,
    getTasks,
    getSubTasks,
    updateTask,
    updateSubTask,
  } = useTasks();

  const { projects } = useProjects();
  const { settings } = useTaskSettings();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [tasksWithSubtasks, setTasksWithSubtasks] = useState<
    TTaskWithSubtasks[]
  >([]);

  const didFetchInitialDataRef = useRef(false);
  const hydratedTasksSignatureRef = useRef("");

  useEffect(() => {
    if (didFetchInitialDataRef.current) return;

    didFetchInitialDataRef.current = true;

    getTasks();
  }, [getTasks]);

  useEffect(() => {
    if (tasks.length === 0) {
      setTasksWithSubtasks([]);
      hydratedTasksSignatureRef.current = "";
      return;
    }

    const baseTasks: TTaskWithSubtasks[] = tasks.map((task) => ({
      ...task,
      subtasks: task.subtasks ?? [],
    }));

    setTasksWithSubtasks(baseTasks);

    const tasksSignature = baseTasks.map((task) => task.id).join("|");

    if (hydratedTasksSignatureRef.current === tasksSignature) return;

    hydratedTasksSignatureRef.current = tasksSignature;

    let isMounted = true;

    const loadSubtasks = async () => {
      const hydratedTasks = await Promise.all(
        baseTasks.map(async (task) => {
          try {
            const subtasksResponse = await getSubTasks(task.id);

            const subtasks = isSubTaskArray(subtasksResponse)
              ? subtasksResponse
              : task.subtasks ?? [];

            return {
              ...task,
              subtasks,
            };
          } catch {
            return {
              ...task,
              subtasks: task.subtasks ?? [],
            };
          }
        })
      );

      if (!isMounted) return;

      setTasksWithSubtasks(hydratedTasks);
    };

    loadSubtasks();

    return () => {
      isMounted = false;
    };
  }, [getSubTasks, tasks]);

  const projectOptions = useMemo<AgendaProjectOption[]>(() => {
    return projects.map((project) => ({
      id: project.id,
      title: project.title,
    }));
  }, [projects]);

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return tasksWithSubtasks;

    return tasksWithSubtasks.filter(
      (task) => task.project_id === selectedProjectId
    );
  }, [tasksWithSubtasks, selectedProjectId]);

  const agendaItems = useMemo(() => {
    return buildAgendaItems(
      filteredTasks,
      settings?.which_date_use_in_calendar ?? "UseBoth",
      projectOptions
    );
  }, [filteredTasks, settings?.which_date_use_in_calendar, projectOptions]);

  const agendaItemsByDate = useMemo(() => {
    return groupAgendaItemsByDate(agendaItems);
  }, [agendaItems]);

  const activeDateKey = hoveredDateKey;

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });

    setHoveredDateKey(null);
    setSelectedDateKey(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });

    setHoveredDateKey(null);
    setSelectedDateKey(null);
  };

  const goToToday = () => {
    const today = new Date();

    setCurrentMonth(today);
    setHoveredDateKey(null);
    setSelectedDateKey(formatDateKey(today));
  };

  const handleHoverDate = (dateKey: string | null) => {
    setHoveredDateKey(dateKey);
  };

  const openDayModal = (dateKey: string) => {
    setSelectedDateKey(dateKey);
    setHoveredDateKey(null);
  };

  const closeDayModal = () => {
    setSelectedDateKey(null);
  };

  const changeSelectedProjectId = (projectId: string) => {
    setSelectedProjectId(projectId);
    setHoveredDateKey(null);
    setSelectedDateKey(null);
  };

  const updateAgendaItemDate = async (item: AgendaItem, newDate: string) => {
    if (!newDate || item.date === newDate) return;

    if (item.type === "task") {
      const payload: Partial<Pick<TTask, "start_date" | "due_date">> = {
        [item.dateType]: newDate,
      };

      await updateTask(item.id, payload);
      return;
    }

    const payload: Partial<Pick<TSubTask, "start_date" | "due_date">> = {
      [item.dateType]: newDate,
    };

    await updateSubTask(item.taskId, item.id, payload);
  };

  const navigateToAgendaItem = (item: AgendaItem) => {
    navigate(`/projects/${item.projectId}/tasks/${item.taskId}`);
  };

  return {
    loading,
    currentMonth,
    agendaItemsByDate,
    activeDateKey,
    selectedDateKey,
    selectedProjectId,
    projectOptions,

    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    handleHoverDate,
    openDayModal,
    closeDayModal,
    updateAgendaItemDate,
    navigateToAgendaItem,
    changeSelectedProjectId,
  };
};
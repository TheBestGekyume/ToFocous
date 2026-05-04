import { useEffect, useMemo, useState } from "react";
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

export const useAgenda = () => {
  const navigate = useNavigate();

  const { tasks, loading, getTasks, updateTask, updateSubTask } = useTasks();
  const { projects, fetchProjects } = useProjects();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null);
  const [pinnedDateKey, setPinnedDateKey] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("all");

  useEffect(() => {
    getTasks();

    if (projects.length === 0) {
      fetchProjects();
    }
  }, [getTasks, fetchProjects, projects.length]);

  const projectOptions = useMemo<AgendaProjectOption[]>(() => {
    const projectIdsWithTasks = new Set(
      tasks.map((task) => task.project_id).filter(Boolean)
    );

    return projects
      .filter((project) => projectIdsWithTasks.has(project.id))
      .map((project) => ({
        id: project.id,
        title: project.title,
      }));
  }, [projects, tasks]);

  const filteredTasks = useMemo(() => {
    if (selectedProjectId === "all") return tasks;

    return tasks.filter((task) => task.project_id === selectedProjectId);
  }, [tasks, selectedProjectId]);

  const agendaItems = useMemo(() => {
    return buildAgendaItems(filteredTasks);
  }, [filteredTasks]);

  const agendaItemsByDate = useMemo(() => {
    return groupAgendaItemsByDate(agendaItems);
  }, [agendaItems]);

  const activeDateKey = pinnedDateKey ?? hoveredDateKey;

  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
    });

    setHoveredDateKey(null);
    setPinnedDateKey(null);
  };

  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      return new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
    });

    setHoveredDateKey(null);
    setPinnedDateKey(null);
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
    setHoveredDateKey(null);
    setPinnedDateKey(formatDateKey(new Date()));
  };

  const handleHoverDate = (dateKey: string | null) => {
    if (pinnedDateKey) return;

    setHoveredDateKey(dateKey);
  };

  const handlePinDate = (dateKey: string) => {
    setPinnedDateKey((prev) => (prev === dateKey ? null : dateKey));
    setHoveredDateKey(null);
  };

  const closePopover = () => {
    setPinnedDateKey(null);
    setHoveredDateKey(null);
  };

  const changeSelectedProjectId = (projectId: string) => {
    setSelectedProjectId(projectId);
    setHoveredDateKey(null);
    setPinnedDateKey(null);
  };

  const updateAgendaItemDate = async (
    item: AgendaItem,
    newDate: string
  ) => {
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
    pinnedDateKey,
    selectedProjectId,
    projectOptions,

    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    handleHoverDate,
    handlePinDate,
    closePopover,
    updateAgendaItemDate,
    navigateToAgendaItem,
    changeSelectedProjectId,
  };
};
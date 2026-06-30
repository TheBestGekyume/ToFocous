import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useProjects } from "./useProjects";
import { useTasks } from "./useTasks";

import type {
  TUpdateSubTaskDTO,
  TUpdateTaskDTO,
} from "../types/TTask";
import {
  type AgendaItem,
  formatDateKey,
  groupAgendaItemsByDate,
} from "../utils/agendaUtils";
import type { AgendaProjectOption } from "../components/Agenda/AgendaHeader";
import {
  getAgendaItems,
  type AgendaItemResponse,
} from "../services/agenda/agendaService";
import { getApiErrorMessage, logApiError } from "../utils/apiError";

const getAgendaCacheKey = (
  year: number,
  month: number,
  projectId: string
): string => {
  return `${year}-${String(month).padStart(2, "0")}-${projectId}`;
};

const mapAgendaResponseToItem = (item: AgendaItemResponse): AgendaItem => {
  return {
    id: item.id,
    type: item.type,
    taskId: item.taskId,
    projectId: item.projectId,
    projectTitle: item.projectTitle ?? undefined,
    parentTitle: item.parentTitle ?? undefined,
    title: item.title,
    status: item.status,
    priority: item.priority,
    date: item.date,
    dateType: item.dateType,
  };
};

export const useAgenda = () => {
  const navigate = useNavigate();

  const { updateTask, updateSubTask } = useTasks();
  const { projects } = useProjects();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredDateKey, setHoveredDateKey] = useState<string | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const agendaCacheRef = useRef<Record<string, AgendaItem[]>>({});

  const currentYear = currentMonth.getFullYear();
  const currentMonthNumber = currentMonth.getMonth() + 1;

  useEffect(() => {
    let isMounted = true;

    const loadAgendaItems = async () => {
      const cacheKey = getAgendaCacheKey(
        currentYear,
        currentMonthNumber,
        selectedProjectId
      );

      const cachedItems = agendaCacheRef.current[cacheKey];

      if (cachedItems) {
        setAgendaItems(cachedItems);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getAgendaItems({
          year: currentYear,
          month: currentMonthNumber,
          projectId: selectedProjectId !== "all" ? selectedProjectId : undefined,
        });

        if (!isMounted) return;

        const mappedItems = response.map(mapAgendaResponseToItem);

        agendaCacheRef.current[cacheKey] = mappedItems;
        setAgendaItems(mappedItems);
      } catch (error: unknown) {
        logApiError("Erro ao carregar agenda", error);

        if (!isMounted) return;

        setAgendaItems([]);
        setError(getApiErrorMessage(error, "Não foi possível carregar a agenda."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadAgendaItems();

    return () => {
      isMounted = false;
    };
  }, [currentYear, currentMonthNumber, selectedProjectId]);

  const projectOptions = useMemo<AgendaProjectOption[]>(() => {
    return projects.map((project) => ({
      id: project.id,
      title: project.title,
    }));
  }, [projects]);

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

    setError(null);

    try {
      if (item.type === "task") {
        const payload: TUpdateTaskDTO = {
          [item.dateType]: newDate,
        };

        await updateTask(item.id, payload);
      } else {
        const payload: TUpdateSubTaskDTO = {
          [item.dateType]: newDate,
        };

        await updateSubTask(item.taskId, item.id, payload);
      }

      setAgendaItems((prevItems) => {
        return prevItems.map((agendaItem) => {
          const isSameItem =
            agendaItem.id === item.id &&
            agendaItem.type === item.type &&
            agendaItem.dateType === item.dateType;

          if (!isSameItem) return agendaItem;

          return {
            ...agendaItem,
            date: newDate,
          };
        });
      });

      agendaCacheRef.current = {};
    } catch (error: unknown) {
      logApiError("Erro ao atualizar data do item da agenda", error);

      setError(
        getApiErrorMessage(error, "Não foi possível atualizar a data do item.")
      );

      throw error;
    }
  };

  const navigateToAgendaItem = (item: AgendaItem) => {
    navigate(`/projects/${item.projectId}/tasks/${item.taskId}`);
  };

  return {
    loading,
    error,

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
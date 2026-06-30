import { useEffect, useState, type ReactNode } from "react";
import { TaskSettingsContext } from "../contexts/TaskSettingsContext";
import type { ITaskSettings } from "../types/TSettings";
import {
  getTaskSettings,
  updateTaskSettings,
} from "../services/tasks/taskSettingsService";
import { logApiError } from "../utils/apiError";

export const TaskSettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<ITaskSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTaskSettings();
        setSettings(data);
      } catch (error: unknown) {
        logApiError("Erro ao buscar configurações de tarefas", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, []);

  const updateSettings = async (data: Partial<ITaskSettings>) => {
    if (!settings) return;

    const updatedSettings: ITaskSettings = {
      ...settings,
      ...data,
    };

    if (!updatedSettings.use_start_date) {
      updatedSettings.which_date_use_in_calendar = "UseDueDate";
    }

    setSettings(updatedSettings);
    setUpdating(true);

    try {
      const savedSettings = await updateTaskSettings(updatedSettings);

      setSettings(savedSettings);
    } catch (error: unknown) {
      logApiError("Erro ao atualizar configurações de tarefas", error);

      setSettings(settings);
    } finally {
      setUpdating(false);
    }
  };

  const canUseStartTime = Boolean(
    settings?.use_time && settings?.use_start_date
  );

  const canShowCalendarOption = Boolean(settings?.use_start_date);

  return (
    <TaskSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        canUseStartTime,
        canShowCalendarOption,
        loading,
        updating,
      }}
    >
      {children}
    </TaskSettingsContext.Provider>
  );
};
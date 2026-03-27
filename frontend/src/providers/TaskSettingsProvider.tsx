import { useEffect, useState, type ReactNode } from "react";
import { TaskSettingsContext } from "../contexts/TaskSettingsContext";
import type { ITaskSettings } from "../types/TSettings";
import {
  getTaskSettings,
  updateTaskSettings,
} from "../services/taskSettingsService";

export const TaskSettingsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [settings, setSettings] = useState<ITaskSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  

  // 🔹 Load inicial
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTaskSettings();
        console.log("meu PIRU BEM GROSSO: ", data)
        setSettings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔹 Update com persistência
  const updateSettings = async (data: Partial<ITaskSettings>) => {
    if (!settings) return;

    const updated = { ...settings, ...data };

    // regra de negócio
    if (!updated.use_start_date) {
      updated.which_date_use_in_calendar = "UseDueDate";
    }

    // optimistic update
    setSettings(updated);
    setUpdating(true);

    try {
      await updateTaskSettings(updated);
    } catch (err) {
      console.error(err);

      // rollback simples
      setSettings(settings);
    } finally {
      setUpdating(false);
    }
  };

  const canUseStartTime =
    settings?.use_time && settings?.use_start_date;

  const canShowCalendarOption =
    settings?.use_start_date;

  return (
    <TaskSettingsContext.Provider
      value={{
        settings,
        updateSettings,
        canUseStartTime: !!canUseStartTime,
        canShowCalendarOption: !!canShowCalendarOption,
        loading,
        updating,
      }}
    >
      {children}
    </TaskSettingsContext.Provider>
  );
};
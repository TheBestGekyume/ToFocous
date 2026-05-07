import { useTaskSettings } from "./useTaskSettings";

export const useTaskVisibilitySettings = () => {
  const { settings } = useTaskSettings();

  return {
    settings,

    showStartDate: settings?.use_start_date ?? false,
    showTime: settings?.use_time ?? false,
    showStartTime: Boolean(settings?.use_time && settings?.use_start_date),
    showSubtaskPriority: settings?.use_subtask_priority ?? false,
  };
};
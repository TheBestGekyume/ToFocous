import { createContext } from "react";
import type { ITaskSettings } from "../types/TSettings";

interface TaskSettingsContextType {
  settings: ITaskSettings | null;
  updateSettings: (data: Partial<ITaskSettings>) => void;

  canUseStartTime: boolean;
  canShowCalendarOption: boolean;

  loading: boolean;
  updating: boolean;
}

export const TaskSettingsContext =
  createContext<TaskSettingsContextType | null>(null);

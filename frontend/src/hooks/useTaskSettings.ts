import { useContext } from "react";
import { TaskSettingsContext } from "../contexts/TaskSettingsContext";

export const useTaskSettings = () => {
  const context = useContext(TaskSettingsContext);

  if (!context) {
    throw new Error("useTaskSettings must be used within provider");
  }

  return context;
};
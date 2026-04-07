import { useEffect, useRef, useState } from "react";
import type { TSubTask } from "../types/TTask";
import { useTasks } from "./useTask";
import { useTaskSettings } from "./useTaskSettings";

type UseSubTaskItemProps = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useSubTaskItem = ({
  subtask,
  taskId,
  setLoading,
}: UseSubTaskItemProps) => {
  const { updateSubTask, deleteSubTask } = useTasks();
  const { settings } = useTaskSettings();

  const [localSubTask, setLocalSubTask] = useState(subtask);

  const lastSavedRef = useRef(subtask);
  const cancelEditRef = useRef(false);

  useEffect(() => {
    setLocalSubTask(subtask);
    lastSavedRef.current = subtask;
  }, [subtask]);

  const isDone = localSubTask.status === "concluded";

  const hasChanged = (a: TSubTask, b: TSubTask) => {
    return (
      a.title !== b.title ||
      a.description !== b.description ||
      a.due_date !== b.due_date ||
      a.start_date !== b.start_date ||
      a.due_time !== b.due_time ||
      a.start_time !== b.start_time ||
      a.status !== b.status
    );
  };

  const commitUpdate = async (updated: TSubTask) => {
    if (!hasChanged(updated, lastSavedRef.current)) return;

    try {
      setLoading(true);
      await updateSubTask(taskId, subtask.id, updated);
      lastSavedRef.current = updated;
    } finally {
      setLoading(false);
    }
  };

  const handleImmediateChange = <K extends keyof TSubTask>(
    field: K,
    value: TSubTask[K]
  ) => {
    if (localSubTask[field] === value) return;

    const updated = {
      ...localSubTask,
      [field]: value,
    };

    setLocalSubTask(updated);
    commitUpdate(updated);
  };

  const handleChange = <K extends keyof TSubTask>(
    field: K,
    value: TSubTask[K]
  ) => {
    setLocalSubTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBlur = async () => {
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }

    if (!localSubTask.title.trim() || !localSubTask.due_date) {
      setLocalSubTask(lastSavedRef.current); // 🔥 corrigido
      return;
    }

    await commitUpdate(localSubTask);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }

    if (e.key === "Escape") {
      cancelEditRef.current = true;
      setLocalSubTask(lastSavedRef.current); // 🔥 corrigido (NUNCA usar subtask)
      (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
    }
  };

  const toggleStatus = () => {
    const updated: TSubTask = {
      ...localSubTask,
      status:
        localSubTask.status === "concluded" ? "unstarted" : "concluded",
    };

    setLocalSubTask(updated);
    commitUpdate(updated);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteSubTask(taskId, subtask.id);
    } finally {
      setLoading(false);
    }
  };

  return {
    // state
    localSubTask,
    settings,
    isDone,

    // computed
    showStartDate: settings?.use_start_date ?? false,
    showTime: settings?.use_time ?? false,
    showStartTime:
      (settings?.use_time && settings?.use_start_date) ?? false,

    // handlers
    handleChange,
    handleBlur,
    handleKeyDown,
    handleImmediateChange,
    toggleStatus,
    handleDelete,
  };
};
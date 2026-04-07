import { useEditableItem } from "./useEditableItem";
import { useTasks } from "./useTasks";
import { useTaskSettings } from "./useTaskSettings";
import type { TSubTask } from "../types/TTask";

type Props = {
  subtask: TSubTask;
  taskId: string;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useSubTaskItem = ({
  subtask,
  taskId,
  setLoading,
}: Props) => {
  const { updateSubTask, deleteSubTask } = useTasks();
  const { settings } = useTaskSettings();

  const editable = useEditableItem<TSubTask>({
    initialData: subtask,
    onUpdate: async (updated) => {
      setLoading(true);
      try {
        await updateSubTask(taskId, subtask.id, updated);
      } finally {
        setLoading(false);
      }
    },
    onDelete: async () => {
      setLoading(true);
      try {
        await deleteSubTask(taskId, subtask.id);
      } finally {
        setLoading(false);
      }
    },
    validate: (t) => !!t.title.trim() && !!t.due_date,
    hasChanged: (a, b) =>
      a.title !== b.title ||
      a.description !== b.description ||
      a.due_date !== b.due_date ||
      a.start_date !== b.start_date ||
      a.due_time !== b.due_time ||
      a.start_time !== b.start_time ||
      a.status !== b.status,
  });

  const isDone = editable.localData.status === "concluded";

  const toggleStatus = () => {
    editable.handleImmediateChange(
      "status",
      isDone ? "unstarted" : "concluded"
    );
  };

  return {
    ...editable,

    settings,
    isDone,

    showStartDate: settings?.use_start_date ?? false,
    showTime: settings?.use_time ?? false,
    showStartTime:
      (settings?.use_time && settings?.use_start_date) ?? false,

    toggleStatus,
  };
};
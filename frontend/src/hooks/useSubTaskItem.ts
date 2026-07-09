import { useMemo } from "react";
import { useEditableItem } from "./useEditableItem";
import { useTasks } from "./useTasks";
import { useTaskVisibilitySettings } from "./useTaskVisibilitySettings";
import { confirmDelete } from "../utils/confirmDelete";
import type { TSubTask, TTask } from "../types/TTask";
import { validateSubTaskDateTime } from "../utils/taskDateTimeValidation";

type Props = {
  subtask: TSubTask;
  taskId: string;
  parentTask: TTask;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useSubTaskItem = ({
  subtask,
  taskId,
  parentTask,
  setLoading,
}: Props) => {
  const { updateSubTask, deleteSubTask } = useTasks();

  const {
    settings,
    showStartDate,
    showTime,
    showStartTime,
    showSubtaskPriority,
  } = useTaskVisibilitySettings();

  const normalizedSubtask = useMemo<TSubTask>(() => {
    return {
      ...subtask,
      priority: subtask.priority ?? "low",
    };
  }, [subtask]);

  const editable = useEditableItem<TSubTask>({
    initialData: normalizedSubtask,

    onUpdate: async (updated) => {
      setLoading(true);

      try {
        await updateSubTask(taskId, subtask.id, updated);
      } finally {
        setLoading(false);
      }
    },

    onDelete: async () => {
      if (subtask.status !== "concluded" && !confirmDelete("subtarefa")) return;

      setLoading(true);

      try {
        await deleteSubTask(taskId, subtask.id);
      } finally {
        setLoading(false);
      }
    },

    validate: (currentSubtask) => {
      if (!currentSubtask.due_date) {
        return "Informe a data de prazo da subtarefa.";
      }

      return validateSubTaskDateTime(currentSubtask, parentTask);
    },

    hasChanged: (currentSubtask, previousSubtask) =>
      currentSubtask.title !== previousSubtask.title ||
      currentSubtask.description !== previousSubtask.description ||
      currentSubtask.due_date !== previousSubtask.due_date ||
      currentSubtask.start_date !== previousSubtask.start_date ||
      currentSubtask.due_time !== previousSubtask.due_time ||
      currentSubtask.start_time !== previousSubtask.start_time ||
      currentSubtask.status !== previousSubtask.status ||
      currentSubtask.priority !== previousSubtask.priority,
  });

  const isDone = editable.localData.status === "concluded";

  const toggleStatus = () => {
    editable.handleImmediateChange(
      "status",
      isDone ? "unstarted" : "concluded"
    );
  };

  const changePriority = (priority: TSubTask["priority"]) => {
    editable.handleImmediateChange("priority", priority);
  };

  const handleDescriptionKeyDown =
    editable.handleTextareaKeyDown("description");

  return {
    ...editable,

    settings,

    isDone,

    showPriority: showSubtaskPriority,
    showStartDate,
    showTime,
    showStartTime,

    toggleStatus,
    changePriority,

    handleDescriptionKeyDown,
  };
};
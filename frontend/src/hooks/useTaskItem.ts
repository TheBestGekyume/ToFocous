import { useNavigate, useParams } from "react-router-dom";
import { useEditableItem } from "./useEditableItem";
import { useTasks } from "./useTasks";
import { useTaskVisibilitySettings } from "./useTaskVisibilitySettings";
import { confirmDelete } from "../utils/confirmDelete";
import type { TTask } from "../types/TTask";

export const useTaskItem = (task: TTask) => {
  const navigate = useNavigate();

  const { taskId, projectId } = useParams<{
    taskId?: string;
    projectId?: string;
  }>();

  const isDetailsPage = Boolean(taskId);

  const { updateTask, deleteTask } = useTasks();

  const {
    settings,
    showStartDate,
    showTime,
    showStartTime,
  } = useTaskVisibilitySettings();

  const editable = useEditableItem<TTask>({
    initialData: task,

    onUpdate: async (updated) => {
      await updateTask(task.id, updated);
    },

    onDelete: async () => {
      if (task.status !== "concluded" && !confirmDelete("tarefa")) return;

      await deleteTask(task.id);
    },

    validate: (currentTask) =>
      Boolean(currentTask.title.trim()) && Boolean(currentTask.due_date),

    hasChanged: (currentTask, previousTask) =>
      currentTask.title !== previousTask.title ||
      currentTask.description !== previousTask.description ||
      currentTask.due_date !== previousTask.due_date ||
      currentTask.start_date !== previousTask.start_date ||
      currentTask.due_time !== previousTask.due_time ||
      currentTask.start_time !== previousTask.start_time ||
      currentTask.priority !== previousTask.priority ||
      currentTask.status !== previousTask.status,
  });

  const isDone = editable.localData.status === "concluded";

  const toggleStatus = () => {
    editable.handleImmediateChange(
      "status",
      isDone ? "unstarted" : "concluded"
    );
  };

  const changeStatus = (status: TTask["status"]) => {
    editable.handleImmediateChange("status", status);
  };

  const changePriority = (priority: TTask["priority"]) => {
    editable.handleImmediateChange("priority", priority);
  };

  const navigateToDetails = () => {
    if (!projectId) return;

    navigate(`/projects/${projectId}/tasks/${task.id}`);
  };

  const handleDescriptionKeyDown =
    editable.handleTextareaKeyDown("description");

  return {
    ...editable,

    settings,

    isDone,
    isDetailsPage,

    showStartDate,
    showTime,
    showStartTime,

    toggleStatus,
    changeStatus,
    changePriority,

    navigateToDetails,
    handleDescriptionKeyDown,
  };
};
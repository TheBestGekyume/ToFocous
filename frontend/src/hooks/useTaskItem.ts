import { useNavigate, useParams } from "react-router-dom";
import { useEditableItem } from "./useEditableItem";
import { useTasks } from "./useTasks";
import { useTaskSettings } from "./useTaskSettings";
import type { TTask } from "../types/TTask";

export const useTaskItem = (task: TTask) => {
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId?: string }>();
    const isDetailsPage = !!taskId;

    const { updateTask, deleteTask } = useTasks();
    const { settings } = useTaskSettings();

    const editable = useEditableItem<TTask>({
        initialData: task,
        onUpdate: (updated) => updateTask(task.id, updated),
        onDelete: () => deleteTask(task.id),
        validate: (t) => !!t.title.trim() && !!t.due_date,
        hasChanged: (a, b) =>
            a.title !== b.title ||
            a.description !== b.description ||
            a.due_date !== b.due_date ||
            a.start_date !== b.start_date ||
            a.due_time !== b.due_time ||
            a.start_time !== b.start_time ||
            a.priority !== b.priority ||
            a.status !== b.status,
    });

    const changeStatus = (status: TTask["status"]) =>
        editable.handleImmediateChange("status", status);

    const changePriority = (priority: TTask["priority"]) =>
        editable.handleImmediateChange("priority", priority);

    const navigateToDetails = () => navigate(`/tarefa/${task.id}`);

    return {
        ...editable,

        settings,
        isDetailsPage,

        showStartDate: settings?.use_start_date ?? false,
        showTime: settings?.use_time ?? false,
        showStartTime:
            (settings?.use_time && settings?.use_start_date) ?? false,

        changeStatus,
        changePriority,
        navigateToDetails,
    };
};
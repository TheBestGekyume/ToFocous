import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { TTask } from "../types/TTask";
import { useTasks } from "./useTask";
import { useTaskSettings } from "./useTaskSettings";

export const useTaskItem = (task: TTask) => {
    const [localTask, setLocalTask] = useState(task);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { taskId } = useParams<{ taskId?: string }>();
    const isDetailsPage = !!taskId;
    const { updateTask, deleteTask } = useTasks();
    const { settings } = useTaskSettings();

    const lastSavedTaskRef = useRef(task);
    const cancelEditRef = useRef(false); // 🔥 NOVO

    useEffect(() => {
        setLocalTask(task);
        lastSavedTaskRef.current = task;
    }, [task]);

    const hasTaskChanged = (a: TTask, b: TTask) => {
        return (
            a.title !== b.title ||
            a.description !== b.description ||
            a.due_date !== b.due_date ||
            a.start_date !== b.start_date ||
            a.due_time !== b.due_time ||
            a.start_time !== b.start_time ||
            a.priority !== b.priority ||
            a.status !== b.status
        );
    };

    const commitUpdate = async (updatedTask: TTask) => {
        if (!hasTaskChanged(updatedTask, lastSavedTaskRef.current)) return;

        try {
            setLoading(true);
            const updated = await updateTask(task.id, updatedTask);
            lastSavedTaskRef.current = updated ?? updatedTask;
        } finally {
            setLoading(false);
        }
    };

    const handleImmediateChange = <K extends keyof TTask>(
        field: K,
        value: TTask[K]
    ) => {
        if (localTask[field] === value) return;

        const updated = {
            ...localTask,
            [field]: value,
        };

        setLocalTask(updated);
        commitUpdate(updated);
    };

    const handleChange = <K extends keyof TTask>(field: K, value: TTask[K]) => {
        setLocalTask((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleBlur = async () => {
        // 🔥 impede commit se veio de ESC
        if (cancelEditRef.current) {
            cancelEditRef.current = false;
            return;
        }

        if (!localTask.title.trim() || !localTask.due_date) {
            setLocalTask(task);
            return;
        }

        await commitUpdate(localTask);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
        }

        if (e.key === "Escape") {
            cancelEditRef.current = true;
            setLocalTask(lastSavedTaskRef.current);
            (e.currentTarget as HTMLInputElement | HTMLTextAreaElement).blur();
        }
    };

    const handleDeleteTask = async () => {
        const deleteConfirm = window.confirm(
            `Quer mesmo deletar a tarefa "${localTask.title}"?`
        );
        if (!deleteConfirm) return;

        try {
            setLoading(true);
            await deleteTask(localTask.id);
        } finally {
            setLoading(false);
        }
    };

    const changeStatus = (status: TTask["status"]) =>
        handleImmediateChange("status", status);

    const changePriority = (priority: TTask["priority"]) =>
        handleImmediateChange("priority", priority);

    const navigateToDetails = () => navigate(`/tarefa/${task.id}`);

    return {
        localTask,
        loading,
        settings,
        isDetailsPage,

        showStartDate: settings?.use_start_date ?? false,
        showTime: settings?.use_time ?? false,
        showStartTime:
            (settings?.use_time && settings?.use_start_date) ?? false,

        handleChange,
        handleBlur,
        handleKeyDown,
        handleDeleteTask,
        changeStatus,
        changePriority,
        handleImmediateChange,
        navigateToDetails,
    };
};
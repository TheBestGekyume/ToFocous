import { useEffect, useState } from "react";
import type { TTask, TSubTask } from "../types/TTask";

type UseTaskFormProps = {
    initialTask?: TTask | TSubTask;
    parentTask?: TTask;
    isCreating: boolean;
    isCreatingSubtask?: boolean;
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
    setSelectedTask?: React.Dispatch<React.SetStateAction<TTask | null>>;
    onClose?: () => void;
};

type TaskFormData = Omit<TTask, "subtasks">;
type SubtaskFormData = TSubTask;

type FormData =
    | { kind: "task"; data: TaskFormData }
    | { kind: "subtask"; data: SubtaskFormData };

const emptyTaskForm: TaskFormData = {
    id: "",
    title: "",
    description: "",
    date: new Date(),
    priority: "low",
    status: "not_started",
};

const emptySubtaskForm: SubtaskFormData = {
    id: "",
    title: "",
    description: "",
    date: new Date(),
    status: "not_started",
};

export const useTaskForm = ({
    initialTask,
    parentTask,
    isCreating,
    isCreatingSubtask = false,
    setTasks,
    setSelectedTask,
    onClose,
}: UseTaskFormProps) => {
    /* =========================
     * STATE
     * ========================= */
    const [formData, setFormData] = useState<FormData>(() =>
        isCreatingSubtask
            ? { kind: "subtask", data: emptySubtaskForm }
            : { kind: "task", data: emptyTaskForm }
    );

    /* =========================
     * EFFECT
     * ========================= */
    useEffect(() => {
        if (!isCreating && initialTask) {
            if (isCreatingSubtask) {
                setFormData({
                    kind: "subtask",
                    data: {
                        ...(initialTask as TSubTask),
                        date: new Date(initialTask.date),
                    },
                });
            } else {
                setFormData({
                    kind: "task",
                    data: {
                        ...(initialTask as TaskFormData),
                        date: new Date(initialTask.date),
                    },
                });
            }
        }
    }, [isCreating, isCreatingSubtask, initialTask]);



    /* =========================
     * HELPER
     * ========================= */

    const getEmptyForm = (isSubtask: boolean): FormData =>
        isSubtask
            ? { kind: "subtask", data: emptySubtaskForm }
            : { kind: "task", data: emptyTaskForm };

    /* =========================
     * HANDLERS
     * ========================= */
    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => {
            if (prev.kind === "task") {
                return {
                    kind: "task",
                    data: {
                        ...prev.data,
                        [name]: name === "date" ? new Date(value) : value,
                    },
                };
            }

            // subtask
            return {
                kind: "subtask",
                data: {
                    ...prev.data,
                    [name]: name === "date" ? new Date(value) : value,
                },
            };
        });
    };


    /* =========================
     * CRUD - TASK
     * ========================= */
    const createTask = () => {
        if (formData.kind !== "task") return;

        const newTask: TTask = {
            ...formData.data,
            id: crypto.randomUUID(),
            subtasks: [],
            date: new Date(formData.data.date),
        };

        setTasks((prev) => [newTask, ...prev]);
    };

    const updateTask = () => {
        if (formData.kind !== "task" || !initialTask) return;

        const updatedTask: TTask = {
            ...formData.data,
            id: initialTask.id,
            subtasks: (initialTask as TTask).subtasks,
            date: new Date(formData.data.date),
        };

        setTasks((prev) =>
            prev.map((t) => (t.id === initialTask.id ? updatedTask : t))
        );

        setSelectedTask?.(updatedTask);
    };

    const deleteTask = () => {
        if (!initialTask) return;
        if (!confirm("Deseja excluir a tarefa?")) return;

        setTasks((prev) => prev.filter((t) => t.id !== initialTask.id));
        setSelectedTask?.(null);
    };

    /* =========================
     * CRUD - SUBTASK
     * ========================= */
    const createSubtask = () => {
        if (formData.kind !== "subtask" || !initialTask) return;

        const newSubtask: TSubTask = {
            ...formData.data,
            id: crypto.randomUUID(),
            date: new Date(formData.data.date),
        };

        setTasks((prev) =>
            prev.map((task) =>
                task.id === initialTask.id
                    ? { ...task, subtasks: [...task.subtasks, newSubtask] }
                    : task
            )
        );

        setSelectedTask?.((prev) =>
            prev?.id === initialTask.id
                ? { ...prev, subtasks: [...prev.subtasks, newSubtask] }
                : prev
        );
    };

    const updateSubtask = () => {
        if (formData.kind !== "subtask" || !parentTask || !initialTask) return;

        const updatedSubtask: TSubTask = {
            ...formData.data,
            id: initialTask.id,
            date: new Date(formData.data.date),
        };

        setTasks((prev) =>
            prev.map((task) =>
                task.id === parentTask.id
                    ? {
                        ...task,
                        subtasks: task.subtasks.map((st) =>
                            st.id === initialTask.id ? updatedSubtask : st
                        ),
                    }
                    : task
            )
        );

        setSelectedTask?.((prev) =>
            prev?.id === parentTask.id
                ? {
                    ...prev,
                    subtasks: prev.subtasks.map((st) =>
                        st.id === initialTask.id ? updatedSubtask : st
                    ),
                }
                : prev
        );
    };

    /* =========================
     * SUBMIT
     * ========================= */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isCreatingSubtask) {
            if (isCreating) createSubtask(); else updateSubtask();
        } else {
            if (isCreating) createTask(); else updateTask();
        }

        setFormData(getEmptyForm(isCreatingSubtask));

        onClose?.();
    };

    return {
        formData: formData.data,
        handleChange,
        handleSubmit,
        deleteTask,
    };
};

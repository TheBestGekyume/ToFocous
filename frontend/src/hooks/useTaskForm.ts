import { useState, useEffect } from "react";
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


export const useTaskForm = ({
    initialTask,
    parentTask,
    isCreating,
    isCreatingSubtask = false,
    setTasks,
    setSelectedTask,
    onClose,
}: UseTaskFormProps) => {


    const [formData, setFormData] = useState<TTask | TSubTask>({
        id: "",
        title: "",
        date: new Date(),
        priority: "low",
        status: "not_started",
        description: "",
    });

    // Preencher campos ao editar
    useEffect(() => {
        if (!isCreating && initialTask) {
            setFormData({
                ...initialTask,
                date: new Date(initialTask.date),
            });
        }
    }, [isCreating, initialTask]);


    // Input genérico
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: name === "date" ? new Date(value) : value,
        }));
    };

    // Submit
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const getSubtaskData = (): TSubTask => {
            const data = formData as Omit<TTask, "priority">;

            return {
                ...data,
                date: new Date(formData.date),
            };
        };



        /* =========================
         * EDITAR SUBTASK
         * ========================= */
        if (!isCreating && isCreatingSubtask && parentTask && initialTask) {
            const updatedSubtask = {
                ...getSubtaskData(),
                id: initialTask.id,
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

            setSelectedTask?.((prev) => {
                if (!prev || prev.id !== parentTask.id) return prev;

                return {
                    ...prev,
                    subtasks: prev.subtasks.map((st) =>
                        st.id === initialTask.id ? updatedSubtask : st
                    ),
                };
            });

            onClose?.();
            return;
        }


        /* =========================
         * CRIAR SUBTASK
         * ========================= */
        if (isCreating && isCreatingSubtask && initialTask) {
            const newSubtask: TSubTask = {
                ...getSubtaskData(),
                id: crypto.randomUUID(),
            };

            setTasks((prev) =>
                prev.map((task) =>
                    task.id === initialTask.id
                        ? {
                            ...task,
                            subtasks: [...task.subtasks, newSubtask],
                        }
                        : task
                )
            );

            setSelectedTask?.((prev) =>
                prev?.id === initialTask.id
                    ? {
                        ...prev,
                        subtasks: [...prev.subtasks, newSubtask],
                    }
                    : prev
            );

            onClose?.();
            return;
        }


        /*CRIAR TASK*/
        if (isCreating && !isCreatingSubtask) {
            const newTask: TTask = {
                ...(formData as TTask),
                id: crypto.randomUUID(),
                date: new Date(formData.date),
                subtasks: [],
            };

            setTasks((prev) => [newTask, ...prev]);

            onClose?.();
            return;
        }

        /*EDITAR TASK*/
        if (!isCreating && initialTask && !isCreatingSubtask) {
            const updatedTask: TTask = {
                ...(formData as TTask),
                id: initialTask.id,
                date: new Date(formData.date),
            };

            setTasks((prev) =>
                prev.map((t) => (t.id === initialTask.id ? updatedTask : t))
            );

            setSelectedTask?.(updatedTask);
            onClose?.();
        }
    };


    const handleDelete = () => {
        if (!initialTask) return;

        if (confirm("Deseja excluir a tarefa?")) {
            setTasks((prev) => prev.filter((t) => t.id !== initialTask.id));
            setSelectedTask?.(null);
            onClose?.();
        }
    };

    return {
        formData,
        handleChange,
        handleSubmit,
        handleDelete,
        setFormData
    };
};

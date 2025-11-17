import { useState, useEffect } from "react";
import type { TTask, TSubTask } from "../types/TTask";

type UseTaskFormProps = {
    initialTask?: TTask;
    isCreating: boolean;
    isCreatingSubtask?: boolean;
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
    setSelectedTask?: React.Dispatch<React.SetStateAction<TTask | null>>;
    onClose?: () => void;
};

export const useTaskForm = ({
    initialTask,
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
        if (!isCreating && initialTask && !isCreatingSubtask) {
            setFormData({
                ...initialTask,
                date: new Date(initialTask.date) // garante Date
            });
        }
    }, [isCreating, isCreatingSubtask, initialTask]);

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

        // Criar Subtask
        if (isCreatingSubtask && initialTask) {
            setTasks((prev) =>
                prev.map((task) =>
                    task.id === initialTask.id
                        ? {
                              ...task,
                              subtasks: [
                                  ...(task.subtasks ?? []),
                                  {
                                      ...formData,
                                      id: crypto.randomUUID(),
                                      date: new Date(formData.date),
                                  } as TSubTask,
                              ],
                          }
                        : task
                )
            );

            // Atualiza selectedTask no SingleView
            setSelectedTask?.((prev) =>
                prev?.id === initialTask.id
                    ? {
                          ...prev,
                          subtasks: [
                              ...(prev.subtasks ?? []),
                              {
                                  ...formData,
                                  id: crypto.randomUUID(),
                                  date: new Date(formData.date),
                              } as TSubTask,
                          ],
                      }
                    : prev
            );

            onClose?.();
            return;
        }

        // Criar Task
        if (isCreating) {
            const newTask: TTask = {
                ...(formData as TTask),
                id: crypto.randomUUID(),
                date: new Date(formData.date),
                subtasks: []
            };

            setTasks((prev) => [newTask, ...prev]);

            setFormData({
                id: "",
                title: "",
                date: new Date(),
                priority: "low",
                status: "not_started",
                description: "",
            });

            return;
        }

        // Editar Task
        if (!isCreating && initialTask) {
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
    
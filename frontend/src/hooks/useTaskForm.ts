import { useEffect, useState } from "react";
import type { TTask, TSubTask, TCreateTaskDTO } from "../types/TTask";
import { taskService } from "../services/taskService";

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
    due_date: "",
    priority: "low",
    status: "unstarted",
    // user_id: "",
    start_date: "",
    start_time: "",
    due_time: ""
};

const emptySubtaskForm: SubtaskFormData = {
    id: "",
    title: "",
    description: "",
    due_date: "",
    priority: "low",
    status: "unstarted",
    task_id: "",
    start_date: "",
    start_time: "",
    due_time: "",
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
                    },
                });
            } else {
                setFormData({
                    kind: "task",
                    data: {
                        ...(initialTask as TaskFormData),
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


    const normalizeTaskPayload = (data: TaskFormData): TCreateTaskDTO => ({
        title: data.title,
        description: data.description || null,
        due_date: data.due_date,
        priority: data.priority,
        status: data.status || null,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        due_time: data.due_time || null,
    });

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
                        [name]: value,
                    },
                };
            }

            // subtask
            return {
                kind: "subtask",
                data: {
                    ...prev.data,
                    [name]: value,
                },
            };
        });
    };


    /* =========================
     * CRUD - TASK
     * ========================= */
    const createTask = async () => {
        if (formData.kind !== "task") return;

        try {
            const payload = normalizeTaskPayload(formData.data);
            console.log(payload)
            const createdTask = await taskService.createTask(payload);
            console.log("Tarefa do post",createdTask)

            setTasks((prev) => [createdTask, ...prev]);
        } catch (err) {
            console.error("Erro ao criar tarefa:", err);
        }
    };

    const updateTask = async () => {
        if (formData.kind !== "task" || !initialTask) return;

        try {
            const updatedTask = await taskService.updateTask(
                initialTask.id,
                formData.data
            );

            setTasks((prev) =>
                prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
            );

            setSelectedTask?.(updatedTask);
        } catch (err) {
            console.error("Erro ao atualizar tarefa:", err);
        }
    };

    const deleteTask = async () => {
        if (!initialTask) return;
        if (!confirm("Deseja excluir a tarefa?")) return;

        try {
            await taskService.deleteTask(initialTask.id);

            setTasks((prev) => prev.filter((t) => t.id !== initialTask.id));
            setSelectedTask?.(null);
        } catch (err) {
            console.error("Erro ao deletar tarefa:", err);
        }
    };

    /* =========================
     * CRUD - SUBTASK
     * ========================= */
    const createSubtask = () => {
        if (formData.kind !== "subtask" || !initialTask) return;

        const newSubtask: TSubTask = {
            ...formData.data,
            id: crypto.randomUUID(),
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
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isCreatingSubtask) {
            if (isCreating) createSubtask(); else updateSubtask();
        } else {

            if (isCreating) await createTask(); else await updateTask();

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

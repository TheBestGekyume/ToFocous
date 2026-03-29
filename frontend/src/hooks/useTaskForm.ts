import { useEffect, useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import type {
    TTask,
    TSubTask,
    TCreateTaskDTO,
    TCreateSubtaskDTO,
} from "../types/TTask";

type UseTaskFormProps = {
    initialTask?: TTask | TSubTask;
    parentTask?: TTask;
    isCreating: boolean;
    isCreatingSubtask?: boolean;
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
    start_date: "",
    start_time: "",
    due_time: "",
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
    onClose,
}: UseTaskFormProps) => {

    const {
        createTask,
        updateTask,
        createSubtask,
        updateSubtask,
    } = useTasks();

    const [formData, setFormData] = useState<FormData>(() =>
        isCreatingSubtask
            ? { kind: "subtask", data: emptySubtaskForm }
            : { kind: "task", data: emptyTaskForm }
    );

    useEffect(() => {
        if (!isCreating && initialTask) {
            if (isCreatingSubtask) {
                setFormData({
                    kind: "subtask",
                    data: { ...(initialTask as TSubTask) },
                });
            } else {
                setFormData({
                    kind: "task",
                    data: { ...(initialTask as TaskFormData) },
                });
            }
        }
    }, [isCreating, isCreatingSubtask, initialTask]);

    const getEmptyForm = (isSubtask: boolean): FormData =>
        isSubtask
            ? { kind: "subtask", data: emptySubtaskForm }
            : { kind: "task", data: emptyTaskForm };

    const normalizeTaskPayload = (data: TaskFormData): TCreateTaskDTO => ({
        title: data.title,
        description: data.description ?? "",
        due_date: data.due_date,
        priority: data.priority,
        status: data.status || null,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        due_time: data.due_time || null,
    });

    const normalizeSubtaskPayload = (data: TSubTask): TCreateSubtaskDTO => ({
        title: data.title,
        description: data.description || null,
        due_date: data.due_date,
        priority: data.priority,
        status: data.status,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        due_time: data.due_time || null,
    });

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

            return {
                kind: "subtask",
                data: {
                    ...prev.data,
                    [name]: value,
                },
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isCreatingSubtask) {

                if (!parentTask) return;

                if (isCreating) {
                    await createSubtask(
                        parentTask.id,
                        normalizeSubtaskPayload(formData.data as TSubTask)
                    );
                } else {
                    await updateSubtask(
                        parentTask.id,
                        (initialTask as TSubTask).id,
                        formData.data
                    );
                }

            } else {

                if (isCreating) {
                    await createTask(normalizeTaskPayload(formData.data as TaskFormData));
                } else {
                    await updateTask(
                        (initialTask as TTask).id,
                        formData.data
                    );
                }

            }

            setFormData(getEmptyForm(isCreatingSubtask));
            onClose?.();

        } catch (err) {
            console.error("Erro ao salvar tarefa", err);
        }
    };

    return {
        formData: formData.data,
        handleChange,
        handleSubmit,
    };
};
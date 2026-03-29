import { useEffect, useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import type {
    TTask,
    TSubTask,
    TCreateTaskDTO,
    TCreateSubTaskDTO,
} from "../types/TTask";

type UseTaskFormProps = {
    initialTask?: TTask | TSubTask;
    parentTask?: TTask;
    isCreating: boolean;
    isCreatingSubTask?: boolean;
    onClose?: () => void;
};

type TaskFormData = Omit<TTask, "subtasks">;
type SubTaskFormData = TSubTask;

type FormData =
    | { kind: "task"; data: TaskFormData }
    | { kind: "subtask"; data: SubTaskFormData };

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

const emptySubTaskForm: SubTaskFormData = {
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
    isCreatingSubTask = false,
    onClose,
}: UseTaskFormProps) => {

    const {
        createTask,
        updateTask,
        createSubTask,
        updateSubTask,
    } = useTasks();

    const [formData, setFormData] = useState<FormData>(() =>
        isCreatingSubTask
            ? { kind: "subtask", data: emptySubTaskForm }
            : { kind: "task", data: emptyTaskForm }
    );

    useEffect(() => {
        if (!isCreating && initialTask) {
            if (isCreatingSubTask) {
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
    }, [isCreating, isCreatingSubTask, initialTask]);

    const getEmptyForm = (isSubTask: boolean): FormData =>
        isSubTask
            ? { kind: "subtask", data: emptySubTaskForm }
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

    const normalizeSubTaskPayload = (data: TSubTask): TCreateSubTaskDTO => ({
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
            if (isCreatingSubTask) {

                if (!parentTask) return;

                if (isCreating) {
                    await createSubTask(
                        parentTask.id,
                        normalizeSubTaskPayload(formData.data as TSubTask)
                    );
                } else {
                    await updateSubTask(
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

            setFormData(getEmptyForm(isCreatingSubTask));
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
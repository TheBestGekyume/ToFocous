import { useEffect, useState } from "react";
import { useTasks } from "./useTasks";
import type {
    TTask,
    TSubTask,
    TCreateTaskDTO,
    TCreateSubTaskDTO,
    TUpdateTaskDTO,
    TUpdateSubTaskDTO,
} from "../types/TTask";
import { useParams } from "react-router-dom";

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
    project_id: "",
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

    const { projectId } = useParams();

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

    const normalizeCreateTaskPayload = (data: TaskFormData): TCreateTaskDTO => ({
        title: data.title,
        due_date: data.due_date,
        project_id: projectId!,
        status: "unstarted",

        description: data.description.trim() || undefined,
        priority: data.priority || undefined,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        due_time: data.due_time || null,
    });

    const normalizeCreateSubTaskPayload = (
        data: TSubTask
    ): TCreateSubTaskDTO => ({
        title: data.title,
        due_date: data.due_date,
        status: "unstarted",

        description: data.description.trim() || undefined,
        priority: data.priority || undefined,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        due_time: data.due_time || null,
    });

    const normalizeUpdateTaskPayload = (
        data: TaskFormData
    ): TUpdateTaskDTO => ({
        title: data.title,
        description: data.description.trim(),
        due_date: data.due_date,
        priority: data.priority,
        status: data.status,
        start_date: data.start_date || null,
        start_time: data.start_time || null,
        due_time: data.due_time || null,
    });

    const normalizeUpdateSubTaskPayload = (
        data: TSubTask
    ): TUpdateSubTaskDTO => ({
        title: data.title,
        description: data.description.trim(),
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
            if (formData.kind === "subtask") {
                if (!parentTask) return;

                if (isCreating) {
                    await createSubTask(
                        parentTask.id,
                        normalizeCreateSubTaskPayload(formData.data)
                    );
                } else {
                    await updateSubTask(
                        parentTask.id,
                        formData.data.id,
                        normalizeUpdateSubTaskPayload(formData.data)
                    );
                }
            }

            if (formData.kind === "task") {
                if (isCreating) {
                    if (!projectId) {
                        throw new Error("Project ID não encontrado");
                    }

                    await createTask(normalizeCreateTaskPayload(formData.data));
                } else {
                    await updateTask(
                        formData.data.id,
                        normalizeUpdateTaskPayload(formData.data)
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
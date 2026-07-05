import { useState } from "react";
import { useParams } from "react-router-dom";
import { useTasks } from "./useTasks";
import type {
  TTask,
  TSubTask,
  TCreateTaskDTO,
  TCreateSubTaskDTO,
} from "../types/TTask";

type UseTaskFormProps = {
  parentTask?: TTask;
  isCreatingSubTask?: boolean;
  onClose?: () => void;
};

type TaskFormData = Omit<TTask, "subtasks">;
type SubTaskFormData = TSubTask;

type TaskFormState =
  | {
      kind: "task";
      data: TaskFormData;
    }
  | {
      kind: "subtask";
      data: SubTaskFormData;
    };

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
  task_id: "",
  title: "",
  description: "",
  due_date: "",
  priority: "low",
  status: "unstarted",
  start_date: "",
  start_time: "",
  due_time: "",
};

const createEmptyForm = (
  isCreatingSubTask: boolean
): TaskFormState => {
  if (isCreatingSubTask) {
    return {
      kind: "subtask",
      data: { ...emptySubTaskForm },
    };
  }

  return {
    kind: "task",
    data: { ...emptyTaskForm },
  };
};

export const useTaskForm = ({
  parentTask,
  isCreatingSubTask = false,
  onClose,
}: UseTaskFormProps) => {
  const { createTask, createSubTask } = useTasks();
  const { projectId } = useParams();

  const [formData, setFormData] = useState<TaskFormState>(() =>
    createEmptyForm(isCreatingSubTask)
  );

  const normalizeCreateTaskPayload = (
    data: TaskFormData,
    currentProjectId: string
  ): TCreateTaskDTO => ({
    title: data.title,
    due_date: data.due_date,
    project_id: currentProjectId,
    status: "unstarted",
    description: data.description.trim() || undefined,
    priority: data.priority || undefined,
    start_date: data.start_date || null,
    start_time: data.start_time || null,
    due_time: data.due_time || null,
  });

  const normalizeCreateSubTaskPayload = (
    data: SubTaskFormData
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

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = event.target;

    setFormData((previousForm) => {
      if (previousForm.kind === "task") {
        return {
          kind: "task",
          data: {
            ...previousForm.data,
            [name]: value,
          },
        };
      }

      return {
        kind: "subtask",
        data: {
          ...previousForm.data,
          [name]: value,
        },
      };
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      if (formData.kind === "subtask") {
        if (!parentTask) {
          throw new Error(
            "A tarefa principal não foi informada para a subtarefa."
          );
        }

        await createSubTask(
          parentTask.id,
          normalizeCreateSubTaskPayload(formData.data)
        );
      } else {
        if (!projectId) {
          throw new Error("Project ID não encontrado.");
        }

        await createTask(
          normalizeCreateTaskPayload(formData.data, projectId)
        );
      }

      setFormData(createEmptyForm(isCreatingSubTask));
      onClose?.();
    } catch (error: unknown) {
      console.error("Erro ao criar tarefa:", error);
    }
  };

  return {
    formData: formData.data,
    handleChange,
    handleSubmit,
  };
};
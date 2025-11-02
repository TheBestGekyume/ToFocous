import { useState, useEffect } from "react";
import type { TTask } from "../types/TTask";

type UseTaskFormProps = {
  initialTask?: TTask;
  isCreating: boolean;
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
  onClose?: () => void;
};

export const useTaskForm = ({ initialTask, isCreating, setTasks, onClose }: UseTaskFormProps) => {
  const [formData, setFormData] = useState<TTask>(
    initialTask || { id: "", title: "", date: new Date(), priority: "low", status: "not_started" }
  );

  useEffect(() => {
    if (!isCreating && initialTask) setFormData(initialTask);
  }, [isCreating, initialTask]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "date" ? new Date(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isCreating) {
      setTasks(prev => [{ ...formData, id: crypto.randomUUID() }, ...prev]);
      setFormData({ id: "", title: "", date: new Date(), priority: "low", status: "not_started" });
    } else {
      setTasks(prev =>
        prev.map(t => (t.id === initialTask?.id ? { ...formData, id: t.id } : t))
      );
      onClose?.();
    }
  };

  const handleDelete = () => {
    const confirmDeletion = confirm("Deseja excluir a tarefa?");
    if (confirmDeletion) {
      if (!initialTask) return;
      setTasks(prev => prev.filter(t => t.id !== initialTask.id));
      onClose?.();
    }
  };

  return { formData, handleChange, handleSubmit, handleDelete, setFormData };
};

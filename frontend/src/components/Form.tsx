import { useTaskForm } from "../hooks/useTaskForm";
import type { TTask } from "../types/TTask";

type FormProps = {
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
    isCreating: boolean;
    isCreatingSubtask?: boolean;
    taskToEdit?: TTask;
    onClose?: () => void;
    setSelectedTask?: React.Dispatch<React.SetStateAction<TTask | null>>;
};

export const Form = ({
    setTasks,
    isCreating,
    isCreatingSubtask,
    taskToEdit,
    setSelectedTask,
    onClose
}: FormProps) => {

    const { formData, handleChange, handleSubmit, handleDelete } = useTaskForm({
        initialTask: taskToEdit,
        isCreating,
        isCreatingSubtask,
        setTasks,
        setSelectedTask,
        onClose,
    });

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex flex-wrap ${isCreating ? "items-start" : "items-end"} gap-4`}
        >
            <fieldset className="flex flex-col flex-1 min-w-[250px]">
                <label htmlFor="title" className="font-semibold mb-1">Título</label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Adicionar nova tarefa..."
                    value={formData.title}
                    onChange={handleChange}
                    autoComplete="off"
                    className="rounded-md bg-zinc-700 p-2 h-10"
                    required
                />
            </fieldset>

            <fieldset className="flex flex-col min-w-40">
                <label className="font-semibold mb-1">Prioridade</label>
                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="rounded-md bg-zinc-700 p-2 h-10"
                >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
            </fieldset>

            <fieldset className="flex flex-col min-w-40">
                <label className="font-semibold mb-1">Data</label>
                <input
                    name="date"
                    type="date"
                    value={new Date(formData.date).toISOString().split("T")[0]}
                    onChange={handleChange}
                    className="rounded-md bg-zinc-700 p-2 h-10"
                />
            </fieldset>

            {!isCreating && (
                <fieldset className="flex flex-col flex-1 min-w-40">
                    <label className="font-semibold mb-1">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="rounded-md bg-zinc-700 p-2 h-10"
                    >
                        <option value="not_started">Não iniciada</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="concluded">Concluída</option>
                    </select>
                </fieldset>
            )}

            <fieldset className="flex flex-col basis-full min-w-40">
                <label className="font-semibold mb-1">Descrição</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="rounded-md bg-zinc-700 p-2 min-h-[60px]"
                />
            </fieldset>

            <button
                type="submit"
                className={`px-6 py-2 h-10 rounded-md bg-green-700 hover:bg-green-800 font-semibold ${
                    isCreating ? "mx-auto" : ""
                }`}
            >
                {isCreating ? "+ Adicionar" : "Salvar alterações"}
            </button>

            {!isCreating && !isCreatingSubtask && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 py-2 h-10 rounded-md bg-red-600 hover:bg-red-700 font-semibold"
                >
                    Deletar
                </button>
            )}
        </form>
    );
};

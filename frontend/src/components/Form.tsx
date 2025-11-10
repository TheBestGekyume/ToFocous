import { useTaskForm } from "../hooks/useTaskForm";
import type { TTask } from "../types/TTask";

type FormProps = {
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
    isCreating: boolean;
    taskToEdit?: TTask;
    onClose?: () => void;
};

export const Form = ({
    setTasks,
    isCreating,
    taskToEdit,
    onClose,
}: FormProps) => {
    const { formData, handleChange, handleSubmit, handleDelete } = useTaskForm({
        initialTask: taskToEdit,
        isCreating,
        setTasks,
        onClose,
    });

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex flex-wrap ${
                isCreating ? "items-start" : "items-end"
            } gap-4 justify-start md:justify-between`}
        >
            <fieldset className="flex flex-col flex-1 min-w-[250px]">
                <label
                    htmlFor="title"
                    className="font-semibold mb-1 text-white"
                >
                    Título
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Adicionar nova tarefa..."
                    value={formData.title}
                    onChange={handleChange}
                    autoComplete="off"
                    className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                    required
                />
            </fieldset>

            <fieldset
                className={`flex flex-col ${
                    isCreating ? "" : ""
                } min-w-[160px]`}
            >
                <label
                    htmlFor="priority"
                    className="font-semibold mb-1 text-white"
                >
                    Prioridade
                </label>
                <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                    required
                >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
            </fieldset>

            <fieldset
                className={`flex flex-col ${
                    isCreating ? "" : ""
                } min-w-[160px]`}
            >
                <label htmlFor="date" className="font-semibold mb-1 text-white">
                    Data de conclusão
                </label>
                <input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date.toISOString().split("T")[0]}
                    onChange={handleChange}
                    className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                    required
                />
            </fieldset>

            {!isCreating && (
                <fieldset className="flex flex-col flex-1 min-w-[160px]">
                    <label
                        htmlFor="status"
                        className="font-semibold mb-1 text-white"
                    >
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                        required
                    >
                        <option value="not_started">Não iniciada</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="concluded">Concluída</option>
                    </select>
                </fieldset>
            )}

            <fieldset className="flex flex-col basis-full min-w-[160px]">
                <label
                    htmlFor="description"
                    className="font-semibold mb-1 text-white"
                >
                    Descrição
                </label>
                <textarea
                    id="description"
                    name="description"
                    placeholder="Detalhes sobre a tarefa..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={1}
                    className="rounded-md bg-zinc-700 p-2 text-white min-h-[60px]"
                />
            </fieldset>

            <button
                type="submit"
                className={`px-6 py-2 h-[40px] rounded-md duration-150 text-white font-semibold 
          bg-green-700 hover:bg-green-800 cursor-pointer ${isCreating ? "mx-auto" : ""}
        }`}
            >
                {isCreating ? "+ Adicionar" : "Salvar alterações"}
            </button>

            {!isCreating && (
                <button
                    type="button"
                    onClick={handleDelete}
                    className="px-6 py-2 h-[40px] rounded-md duration-150 text-white font-semibold bg-red-600 hover:bg-red-700 cursor-pointer"
                >
                    Deletar
                </button>
            )}
        </form>
    );
};

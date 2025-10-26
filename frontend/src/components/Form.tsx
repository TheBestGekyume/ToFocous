import { useEffect, useState } from "react";
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
    const [formData, setFormData] = useState<TTask>({
        id: "",
        title: "",
        date: new Date(),
        priority: "low",
        status: "not_started",
    });

    useEffect(() => {
        if (!isCreating && taskToEdit) {
            setFormData(taskToEdit);
        }
    }, [isCreating, taskToEdit]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "date" ? new Date(value) : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isCreating) {
            const newTask = {
                ...formData,
                id: crypto.randomUUID(),
            };
            setTasks((prev) => [newTask, ...prev ]);
        } else {
            setTasks((prev) =>
                prev.map((t) => (t.id === taskToEdit?.id ? formData : t))
            );
            if (onClose) onClose();
        }

        if (isCreating) {
            setFormData({
                id: "",
                title: "",
                date: new Date(),
                priority: "low",
                status: "not_started",
            });
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-wrap items-end gap-4 justify-start md:justify-between"
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
                    className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                    type="text"
                    name="title"
                    placeholder="Adicionar nova tarefa..."
                    value={formData.title}
                    onChange={handleChange}
                    required
                />
            </fieldset>

            <fieldset className="flex flex-col w-[140px]">
                <label
                    htmlFor="priority"
                    className="font-semibold mb-1 text-white"
                >
                    Prioridade
                </label>
                <select
                    id="priority"
                    className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                </select>
            </fieldset>

            <fieldset className="flex flex-col w-[160px]">
                <label htmlFor="date" className="font-semibold mb-1 text-white">
                    Data de conclusão
                </label>
                <input
                    id="date"
                    type="date"
                    name="date"
                    className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                    value={new Date(formData.date).toISOString().split("T")[0]}
                    onChange={handleChange}
                    required
                />
            </fieldset>

            {!isCreating && (
                <fieldset className="flex flex-col w-[160px]">
                    <label
                        htmlFor="status"
                        className="font-semibold mb-1 text-white"
                    >
                        Status
                    </label>
                    <select
                        id="status"
                        name="status"
                        className="rounded-md bg-zinc-700 p-2 text-white h-[40px]"
                        value={formData.status}
                        onChange={handleChange}
                        required
                    >
                        <option value="not_started">Não iniciada</option>
                        <option value="in_progress">Em andamento</option>
                        <option value="concluded">Concluída</option>
                    </select>
                </fieldset>
            )}

            <button
                type="submit"
                className={`${
                    isCreating
                        ? "bg-green-700 hover:bg-green-800"
                        : "bg-yellow-600 hover:bg-yellow-700"
                } px-4 py-2 h-[40px] rounded-md duration-150 text-white font-semibold`}
            >
                {isCreating ? "+ Adicionar" : "Salvar alterações"}
            </button>
        </form>
    );
};

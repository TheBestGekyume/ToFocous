import { useState } from "react";
import type { TTask } from "../types/TTask";

type FormProps = {
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const Form = ({ setTasks }: FormProps) => {
    const [formData, setFormData] = useState<TTask>({
        title: "",
        date: new Date(),
        priority: "low",
        status: "not started",
    });

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
        if (!formData.title) return;

        setTasks((prev) => [...prev, formData]);

        setFormData({
            title: "",
            date: new Date(),
            priority: "low",
            status: "not started",
        });
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
                    onChange={handleChange}
                />
            </fieldset>

            <button
                type="submit"
                className="bg-green-700 px-4 py-2 h-[40px] rounded-md duration-150 hover:bg-green-800 text-white font-semibold"
            >
                + Adicionar
            </button>
        </form>
    );
};

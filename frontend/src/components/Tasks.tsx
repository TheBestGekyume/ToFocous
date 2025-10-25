import { useEffect, useState } from "react";
import { Form } from "./Form";
import { Task } from "./Task";
import type { TTask } from "../types/TTask";

export const Tasks = () => {
    const [tasks, setTasks] = useState<TTask[]>(() => {
        const stored = localStorage.getItem("tasks");
        if (!stored) return [];
        try {
            return JSON.parse(stored).map((t: TTask) => ({
                ...t,
                date: new Date(t.date),
            }));
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    return (
        <section id="tasks" className="bg-slate-900 p-5 sm:p-8 md:p-10">
            <div
                className="flex flex-col mx-auto w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-4xl
        border border-zinc-700 rounded-xl p-5 gap-8"
            >
                <Form setTasks={setTasks} />

                <div className="flex flex-wrap justify-center md:justify-between gap-3">
                    <div className="flex flex-wrap gap-3">
                        <button className="p-2 border border-slate-500 bg-slate-600 rounded-md hover:bg-slate-700 duration-200 focus:bg-purple-700">
                            Todas
                        </button>
                        <button className="p-2 border border-slate-500 bg-slate-600 rounded-md hover:bg-slate-700 duration-200 focus:bg-purple-700">
                            Ativas
                        </button>
                        <button className="p-2 border border-slate-500 bg-slate-600 rounded-md hover:bg-slate-700 duration-200 focus:bg-purple-700">
                            Concluídas
                        </button>
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                const filtered = tasks.filter(
                                    (t) => t.status !== "concluded"
                                );
                                setTasks(filtered);
                            }}
                            className="p-2 border border-red-400 bg-slate-600 text-red-400 font-bold 
              rounded-md hover:bg-red-600 hover:text-white duration-200"
                        >
                            Limpar Concluídas
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    {tasks.length > 0 ? (
                        tasks.map((task, index) => (
                            <Task key={index} task={task} />
                        ))
                    ) : (
                        <p className="text-zinc-500 text-center italic">
                            Nenhuma tarefa adicionada ainda.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

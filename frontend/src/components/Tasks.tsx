import { useEffect, useState } from "react";
import { Form } from "./Form";
import { Task } from "./Task";
import type { TTask } from "../types/TTask";
import { Filter } from "./Filter";

export const Tasks = () => {
    const [tasks, setTasks] = useState<TTask[]>(() => {
        const stored = localStorage.getItem("tasks");
        if (!stored) return [];
        try {
            return JSON.parse(stored).map((task: TTask) => ({
                ...task,
                date: new Date(task.date),
            }));
        } catch {
            console.error("Não foi possível recuperar as tarefas do armazenamento local!")
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);

    return (
        <section id="tasks" className="p-5 sm:p-8 md:p-10 md:pt-0">
            <div
                className="flex flex-col mx-auto w-full max-w-sm sm:max-w-xl md:max-w-3xl lg:max-w-4xl
        border border-zinc-700 rounded-xl p-5 gap-8"
            >
                <Form setTasks={setTasks} isCreating={true} />

                <hr className="text-zinc-700" />

                <Filter tasks={tasks} setTasks={setTasks} />

                <div className="flex flex-col gap-3">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <Task
                                key={task.id}
                                task={task}
                                setTasks={setTasks}
                            />
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

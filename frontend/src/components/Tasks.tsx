import { Form } from "./Form";
import { Task } from "./Task";
import { SortTasks } from "./SortTasks";
import { useTasks } from "../contexts/TasksContext";

export const Tasks = () => {
    const { tasks, setTasks } = useTasks();

    return (
        <section id="tasks" className="p-5 sm:p-8 md:p-10 md:pt-0">
            <div className="flex flex-col mx-auto w-full max-w-4xl border border-zinc-700 rounded-xl p-5 gap-8">
                <Form setTasks={setTasks} isCreating={true} />

                <hr className="text-zinc-700" />

                <SortTasks />

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

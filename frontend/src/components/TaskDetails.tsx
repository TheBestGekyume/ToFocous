import { useState } from "react";
import { useTasks } from "../contexts/TasksContext";
import { Form } from "./Form";
import { Modal } from "./Modal";
import { priorityMap } from "../utils/taskUtils";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";

export const TaskDetails = () => {
    const { selectedTask, setSelectedTask, setTasks } = useTasks();
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isCreatingSubtask, setIsCreatingSubtask] = useState(false);

    if (!selectedTask) return null;

    const currentPriority = priorityMap[selectedTask.priority];

    return (
        <div className="flex flex-col gap-4">
            <div className="block md:flex">
                <button
                    className="p-2 bg-zinc-700/75 hover:bg-zinc-800/75 duration-300 w-fit rounded-full h-fit"
                    onClick={() => setSelectedTask(null)}
                >
                    <ArrowLeft size={24} />
                </button>

                <section
                    className={`flex flex-col gap-4 p-4 mt-4 md:mt-0 bg-accent/25 rounded-md border mx-auto ${currentPriority.border}`}
                >
                    <div className="flex flex-col gap-2 lg:flex-row items-baseline justify-between">
                        <h3 className="font-semibold text-xl">
                            {selectedTask.title}
                        </h3>

                        <p className="text-sm text-zinc-300 bg-zinc-950 px-2 rounded-sm">
                            {new Date(selectedTask.date).toLocaleDateString(
                                "pt-BR",
                                {
                                    timeZone: "UTC",
                                }
                            )}
                        </p>
                    </div>

                    <div className="flex gap-4 items-end justify-between">
                        <p className="text-zinc-300 w-4/5">
                            {selectedTask.description}
                        </p>

                        <button
                            className="p-2 bg-yellow-600 hover:bg-yellow-800 duration-300 rounded-full"
                            onClick={() => setIsEditOpen(true)}
                        >
                            <Pencil size={18} />
                        </button>
                    </div>
                </section>

                <button
                    className="p-2 bg-red-600 hover:bg-red-800 duration-300 w-fit rounded-full h-fit"
                    onClick={() => setSelectedTask(null)}
                >
                    <Trash2 size={24} />
                </button>
            </div>

            <hr className="my-3 text-accent/75" />

            {selectedTask.subtasks?.length > 0 && (
                <section className="flex flex-col gap-2">
                    {selectedTask.subtasks.map((st) => (
                        <div
                            key={st.id}
                            className="p-2 bg-zinc-800 border border-zinc-600 rounded-md"
                        >
                            <h4 className="font-semibold">{st.title}</h4>
                            <p className="text-sm text-zinc-400">
                                {new Date(st.date).toLocaleDateString("pt-BR", {
                                    timeZone: "UTC",
                                })}
                            </p>
                        </div>
                    ))}
                </section>
            )}

            <button
                className="px-4 py-2 mx-auto bg-green-600 hover:bg-green-800 duration-300 rounded-md w-fit font-semibold"
                onClick={() => setIsCreatingSubtask(true)}
            >
                + SubTask
            </button>

            {/* Modal de editar */}
            <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)}>
                <Form
                    isCreating={false}
                    taskToEdit={selectedTask}
                    setTasks={setTasks}
                    setSelectedTask={setSelectedTask}
                    onClose={() => setIsEditOpen(false)}
                />
            </Modal>

            {/* Modal de subtask */}
            <Modal
                isOpen={isCreatingSubtask}
                onClose={() => setIsCreatingSubtask(false)}
            >
                <Form
                    isCreating={false}
                    isCreatingSubtask
                    taskToEdit={selectedTask}
                    setTasks={setTasks}
                    setSelectedTask={setSelectedTask}
                    onClose={() => setIsCreatingSubtask(false)}
                />
            </Modal>
        </div>
    );
};

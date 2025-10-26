import { useState } from "react";
import { Modal } from "./Modal";
import { Form } from "./Form";
import type { TTask } from "../types/TTask";
import { CheckCircle, Clock, AlertCircle, Pencil } from "lucide-react";

type TaskProps = {
    task: TTask;
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const Task = ({ task, setTasks }: TaskProps) => {
    const { title, date, priority, status } = task;
    const [isModalOpen, setIsModalOpen] = useState(false);

    const priorityMap = {
        high: {
            label: "Alta",
            color: "text-red-300",
            border: "border-red-400",
        },
        medium: {
            label: "Média",
            color: "text-yellow-200",
            border: "border-yellow-300",
        },
        low: {
            label: "Baixa",
            color: "text-green-300",
            border: "border-green-400",
        },
    };

    const currentPriority = priorityMap[priority];

    const statusMap = {
        concluded: {
            label: "Concluída",
            color: "text-green-200",
            bg: "bg-green-700/50",
            icon: <CheckCircle className="text-green-200" size={18} />,
        },
        in_progress: {
            label: "Em andamento",
            color: "text-yellow-200",
            bg: "bg-yellow-700/50",
            icon: <Clock className="text-yellow-200" size={18} />,
        },
        not_started: {
            label: "Não iniciada",
            color: "text-zinc-200",
            bg: "bg-zinc-700/50",
            icon: <AlertCircle className="text-gray-200" size={18} />,
        },
    };

    const currentStatus = statusMap[status];

    const today = new Date();
    const taskDate = new Date(date);
    const diffTime = taskDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let timeMessage = "";
    let timeColor = "";

    if (diffDays > 1) {
        timeMessage = `${diffDays} dias restantes!`;
        timeColor = "text-blue-300";
    } else if (diffDays === 1) {
        timeMessage = "Para amanhã!";
        timeColor = "text-blue-400";
    } else if (diffDays === 0) {
        timeMessage = "Para hoje!";
        timeColor = "text-yellow-400";
    } else {
        timeMessage = `Atrasada há ${Math.abs(diffDays)} dias!`;
        timeColor = "text-red-400";
    }

    return (
        <>
            <div
                className={`flex justify-between items-center p-3
                border-2 ${currentPriority.border} rounded-lg bg-zinc-800
                hover:bg-zinc-900 duration-150`}
            >
                <div>
                    <div className="flex gap-3 items-center">
                        <h3
                            className={`font-semibold text-white ${
                                status === "concluded"
                                    ? "line-through text-zinc-400"
                                    : ""
                            }`}
                        >
                            {title}
                        </h3>

                    {status !== "concluded" && (

                        <p className="text-sm text-zinc-400 bg-zinc-950 px-2 rounded-sm">
                            {new Date(date).toLocaleDateString("pt-BR")}
                        </p>
                    )}
                    </div>
                    {status !== "concluded" && (
                        <p className={`text-xs mt-1 ${timeColor}`}>
                            {timeMessage}
                        </p>
                    )}
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex flex-col items-end text-sm">
                        <div
                            className={`font-semibold ${currentPriority.color} p-1`}
                        >
                            Prioridade: {currentPriority.label}
                        </div>
                        <div
                            className={`flex items-center gap-1 ${currentStatus.bg} rounded-sm p-1`}
                        >
                            {currentStatus.icon}
                            <span className={currentStatus.color}>
                                {currentStatus.label}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-1 rounded-full cursor-pointer
                        bg-yellow-500 hover:bg-yellow-300
                        border-2 border-transparent hover:border-white
                        duration-300"
                    >
                        <Pencil className="size-4" />
                    </button>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <h4 className="font-bold mb-4 text-xl">Editar Tarefa</h4>
                <Form
                    isCreating={false}
                    taskToEdit={task}
                    setTasks={setTasks}
                    onClose={() => setIsModalOpen(false)}
                />
            </Modal>
        </>
    );
};

import type { TTask } from "../types/TTask";
import { CheckCircle, Clock, AlertCircle } from "lucide-react";

type TaskProps = {
    task: TTask;
};

export const Task = ({ task }: TaskProps) => {
    const { title, date, priority, status } = task;

    // Cor visual da prioridade
    const priorityColor =
        priority === "high"
            ? "text-red-400"
            : priority === "medium"
            ? "text-yellow-400"
            : "text-green-400";

    // Ícone visual de status
    const statusIcon =
        status === "concluded" ? (
            <CheckCircle className="text-green-400" size={18} />
        ) : status === "in progress" ? (
            <Clock className="text-yellow-400" size={18} />
        ) : (
            <AlertCircle className="text-gray-400" size={18} />
        );

    return (
        <div
            className="flex justify-between items-center bg-slate-800 border border-slate-700
      rounded-lg p-3 hover:bg-slate-700 transition-colors duration-150"
        >
            <div className="flex flex-col">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-sm text-zinc-400">
                    {new Date(date).toLocaleDateString("pt-BR")}
                </p>
            </div>

            <div className="flex flex-col items-end text-sm">
                <div className={`font-semibold ${priorityColor}`}>
                    Prioridade: {priority}
                </div>
                <div className="flex items-center gap-1 text-zinc-400">
                    {statusIcon}
                    <span>{status}</span>
                </div>
            </div>
        </div>
    );
};

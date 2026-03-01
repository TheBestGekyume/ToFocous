import type { TTask } from "../../types/TTask";
import { priorityMap, statusMap, getTimeMessage } from "../../utils/taskUtils";
import { useTasks } from "../../contexts/TasksContext";

type TaskProps = {
    task: TTask;
    setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const Task = ({ task }: TaskProps) => {
    const { setSelectedTask } = useTasks();
    const { title, due_date, priority, status } = task;
    const currentPriority = priorityMap[priority];
    const currentStatus = statusMap[status];
    const { msg: timeMessage, color: timeColor } = getTimeMessage(new Date(due_date));

    return (
        <>
            <div
                onClick={() => setSelectedTask(task)}
                className={`flex justify-between items-center p-3 border-2 ${currentPriority.border}
                    rounded-lg bg-zinc-800 hover:bg-zinc-900 duration-150 cursor-pointer`}
            >
                <div>
                    <div className="flex gap-4 flex-col lg:flex-row items-baseline">
                        <h3
                            className={`font-semibold ${
                                status === "concluded" ? "line-through text-zinc-400" : ""
                            }`}
                        >
                            {title.length > 60 ? `${title.substring(0, 60)}...` : title}
                        </h3>

                        {status !== "concluded" && (
                            <p className="text-sm text-zinc-400 bg-zinc-950 px-2 rounded-sm">
                                {due_date}
                            </p>
                        )}
                    </div>

                    {status !== "concluded" && (
                        <p className={`text-xs mt-4 ${timeColor}`}>{timeMessage}</p>
                    )}
                </div>

                <div className="flex flex-col items-end justify-end text-sm">
                    <span
                        className={`font-semibold p-1 text-nowrap ${currentPriority.color}`}
                    >
                        Prioridade: {currentPriority.label}
                    </span>
                    <div
                        className={`flex items-center gap-1 ${currentStatus.bg} rounded-sm p-1`}
                    >
                        {currentStatus.icon}
                        <span className={`text-nowrap ${currentStatus.color}`}>
                            {currentStatus.label}
                        </span>
                    </div>
                </div>
            </div>

        </>
    );
};

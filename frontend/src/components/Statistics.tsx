import { ClipboardCheck, ClipboardClock, NotepadText } from "lucide-react";
import { useTasks } from "../contexts/TasksContext";
import type { JSX } from "react";

export const Statistics = () => {
    const { tasks } = useTasks();
    const total = tasks.length;
    const concluded = tasks.filter((t) => t.status === "concluded").length;
    const pending = tasks.filter((t) => t.status !== "concluded").length;

    const Card = ({
        title,
        count,
        icon,
        bg,
        border,
    }: {
        title: string;
        count: number;
        icon: JSX.Element;
        bg: string;
        border: string;
    }) => (
        <div
            className={`flex flex-1 items-center justify-between gap-5 p-3 border-2 rounded-xl ${bg} ${border}`}
        >
            <div>
                <h4 className="font-semibold text-white">{title}</h4>
                <p className="text-xl font-bold text-white">{count}</p>
            </div>
            {icon}
        </div>
    );

    return (
        <section className="max-w-1/2 mx-auto">
            <div className="flex flex-wrap justify-center gap-5 p-5">
                <Card
                    title="Total"
                    count={total}
                    icon={<ClipboardClock />}
                    bg="bg-zinc-600"
                    border="border-zinc-300"
                />
                <Card
                    title="Pendentes"
                    count={pending}
                    icon={<NotepadText />}
                    bg="bg-amber-600"
                    border="border-amber-300"
                />
                <Card
                    title="Concluídas"
                    count={concluded}
                    icon={<ClipboardCheck />}
                    bg="bg-green-600"
                    border="border-green-300"
                />
            </div>
        </section>
    );
};

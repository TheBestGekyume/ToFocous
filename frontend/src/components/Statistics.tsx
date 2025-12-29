import { useState, type JSX } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { ChartPie, ClipboardCheck, ClipboardClock, LayoutGrid, NotepadText } from "lucide-react";
import { useTasks } from "../contexts/TasksContext";
import { AnimatePresence, motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

export const Statistics = () => {
    const { tasks } = useTasks();

    const total = tasks.length;

    // NOVO: contagem por status completo
    const notStarted = tasks.filter((t) => t.status === "not_started").length;
    const inProgress = tasks.filter((t) => t.status === "in_progress").length;
    const concluded = tasks.filter((t) => t.status === "concluded").length;

    const pending = total - concluded;

    const [view, setView] = useState<"cards" | "chart">("cards");

    const chartData = {
        labels: ["Não iniciadas", "Em andamento", "Concluídas"],
        datasets: [
            {
                data: [notStarted, inProgress, concluded],
                backgroundColor: [
                    "rgba(156, 163, 175, 0.85)",
                    "rgba(245, 158, 11, 0.85)",
                    "rgba(22, 163, 74, 0.85)",
                ],
                hoverBackgroundColor: [
                    "rgba(156, 163, 175, 1)",
                    "rgba(245, 158, 11, 1)",
                    "rgba(22, 163, 74, 1)",
                ],
                borderColor: "rgba(255, 255, 255, 0.75)",
                borderWidth: 1,
                hoverOffset: 0,
                spacing: 0,
            },
        ],
    };

    const chartOptions = {
        plugins: {
            legend: { display: false },
        },
    };

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
        <section className="max-w-2/3 lg:max-w-1/2 mx-auto p-5 mb-5">
            {/* Botão de troca */}
            <div className="flex justify-end mb-5 ">
                <button
                    onClick={() => setView(view === "cards" ? "chart" : "cards")}
                    className="px-4 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700"
                >
                    {view === "cards" ? <ChartPie /> : <LayoutGrid />}
                </button>
            </div>

            {/* Cards — NÃO ALTEREI */}
            <div className="bg-slate-950 p-5 border-2 border-primary rounded-lg">
                <AnimatePresence mode="wait">
                    {view === "cards" ? (
                        <motion.div
                            key="cards"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="flex flex-wrap justify-center gap-5"
                        >
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
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chart"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.25 }}
                            className="max-w-xs mx-auto flex flex-col items-center"
                        >
                            <div className="flex flex-col lg:flex-row gap-3 mb-4 text-zinc-200">
                                <div className="flex items-center gap-2">
                                    <span className="p-2 rounded-xs bg-zinc-600" />
                                    <p className="font-medium text-nowrap">
                                        Não iniciadas ({notStarted})
                                    </p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="p-2 rounded-xs bg-amber-500" />
                                    <span className="font-medium text-nowrap">
                                        Em andamento ({inProgress})
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="p-2 rounded-xs bg-green-600" />
                                    <span className="font-medium text-nowrap">
                                        Concluídas ({concluded})
                                    </span>
                                </div>
                            </div>

                            <Pie data={chartData} options={chartOptions} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
};

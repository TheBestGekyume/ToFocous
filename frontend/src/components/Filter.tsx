import type { TTask } from "../types/TTask";

type FilterProps = {
  tasks: TTask[];
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
};

export const Filter = ({ tasks, setTasks }: FilterProps) => {
    return (
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
                            (task) => task.status !== "concluded"
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
    );
};

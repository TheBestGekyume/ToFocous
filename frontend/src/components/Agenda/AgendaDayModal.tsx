import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import {
  agendaDateTypeLabel,
  agendaPriorityStyle,
  getReadableDate,
  type AgendaItem,
} from "../../utils/agendaUtils";

type AgendaDayModalProps = {
  dateKey: string;
  items: AgendaItem[];
  onClose: () => void;
  onUpdateDate: (item: AgendaItem, newDate: string) => Promise<void>;
  onNavigate: (item: AgendaItem) => void;
};

export const AgendaDayModal = ({
  dateKey,
  items,
  onClose,
  onUpdateDate,
  onNavigate,
}: AgendaDayModalProps) => {
  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-zinc-800 p-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-100">
              {getReadableDate(dateKey)}
            </h2>

            <p className="text-sm text-zinc-400">
              {items.length} item{items.length !== 1 ? "s" : ""} neste dia
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-zinc-800 p-2 text-zinc-300 duration-150 hover:bg-zinc-700"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="grid gap-3 md:grid-cols-2">
            {items.map((item) => {
              const priority = agendaPriorityStyle[item.priority];

              return (
                <article
                  key={`${item.type}-${item.id}-${item.dateType}`}
                  className={`rounded-lg border ${priority.border} bg-zinc-900 p-4`}
                >
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${priority.bg}`}
                    >
                      {priority.label}
                    </span>

                    

                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                      {item.type === "task" ? "Task" : "Subtask"}
                    </span>
                  </div>

                  <h3
                    className={`text-sm font-semibold ${
                      item.status === "concluded"
                        ? "text-zinc-500 line-through"
                        : "text-zinc-100"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-400">
                    {item.projectTitle && (
                      <p>
                        Projeto:{" "}
                        <span className="text-zinc-300">
                          {item.projectTitle}
                        </span>
                      </p>
                    )}

                    {item.type === "subtask" && item.parentTitle && (
                      <p>
                        Task:{" "}
                        <span className="text-zinc-300">
                          {item.parentTitle}
                        </span>
                      </p>
                    )}
                  </div>


                  <div className="mt-4 flex flex-col gap-3">
                    <label className="flex flex-col gap-1 text-xs text-zinc-400">
                      Realocar{" "}
                      {agendaDateTypeLabel[item.dateType].toLowerCase()}
                      <input
                        type="date"
                        value={item.date}
                        onChange={(e) => onUpdateDate(item, e.target.value)}
                        className="rounded-md border border-zinc-700 bg-zinc-950 px-2 py-1
                        text-sm text-zinc-100 outline-none duration-150 focus:border-accent"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => onNavigate(item)}
                      className="flex items-center justify-center gap-2 rounded-md bg-indigo-600
                      px-3 py-2 text-sm font-semibold text-white duration-150 hover:bg-indigo-800"
                    >
                      <ExternalLink size={16} />
                      {item.type === "task" ? "Abrir task" : "Abrir task pai"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

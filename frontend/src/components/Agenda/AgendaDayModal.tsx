import { ExternalLink } from "lucide-react";
import {
  agendaDateTypeLabel,
  agendaPriorityStyle,
  getReadableDate,
  type AgendaItem,
} from "../../utils/agendaUtils";
import { Modal } from "../_Common/Modal";

type AgendaDayModalProps = {
  isOpen: boolean;
  dateKey: string;
  items: AgendaItem[];
  onClose: () => void;
  onUpdateDate: (item: AgendaItem, newDate: string) => Promise<void>;
  onNavigate: (item: AgendaItem) => void;
};

export const AgendaDayModal = ({
  isOpen,
  dateKey,
  items,
  onClose,
  onUpdateDate,
  onNavigate,
}: AgendaDayModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getReadableDate(dateKey)}
      subtitle={`${items.length} item${items.length !== 1 ? "s" : ""} neste dia`}
      size="lg"
      scrollable
    >
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((item) => {
          const priority = agendaPriorityStyle[item.priority];

          return (
            <article
              key={`${item.type}-${item.id}-${item.dateType}`}
              className={`rounded-lg border ${priority.border} bg-background-body p-4`}
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-bold text-white ${priority.bg}`}
                >
                  {priority.label}
                </span>

                <span className="rounded-full bg-background-header px-2 py-0.5 text-xs text-text/80">
                  {item.type === "task" ? "Task" : "Subtask"}
                </span>
              </div>

              <h3
                className={`text-sm font-semibold ${
                  item.status === "concluded"
                    ? "text-text/40 line-through"
                    : "text-text"
                }`}
              >
                {item.title}
              </h3>

              <div className="mt-2 flex flex-col gap-1 text-xs text-text/70">
                {item.projectTitle && (
                  <p>
                    Projeto:{" "}
                    <span className="text-text">{item.projectTitle}</span>
                  </p>
                )}

                {item.type === "subtask" && item.parentTitle && (
                  <p>
                    Task: <span className="text-text">{item.parentTitle}</span>
                  </p>
                )}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                <label className="flex flex-col gap-1 text-xs text-text/70">
                  Realocar {agendaDateTypeLabel[item.dateType].toLowerCase()}

                  <input
                    type="date"
                    value={item.date}
                    onChange={(event) =>
                      onUpdateDate(item, event.target.value)
                    }
                    className="
                      rounded-md border border-secondary/30 bg-background-header px-2 py-1
                      text-sm text-text outline-none transition focus:border-accent
                    "
                  />
                </label>

                <button
                  type="button"
                  onClick={() => onNavigate(item)}
                  className="
                    flex items-center justify-center gap-2 rounded-md bg-accent
                    px-3 py-2 text-sm font-semibold text-white transition hover:opacity-80
                  "
                >
                  <ExternalLink size={16} />
                  {item.type === "task" ? "Abrir task" : "Abrir task pai"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </Modal>
  );
};
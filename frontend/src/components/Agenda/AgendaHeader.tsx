import { ChevronLeft, ChevronRight } from "lucide-react";
import { AgendaProjectFilter } from "./AgendaProjectFilter";
import { getMonthTitle } from "../../utils/agendaUtils";

export type AgendaProjectOption = {
  id: string;
  title: string;
};

type AgendaHeaderProps = {
  currentMonth: Date;
  selectedProjectId: string;
  projectOptions: AgendaProjectOption[];
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onChangeProject: (projectId: string) => void;
};

export const AgendaHeader = ({
  currentMonth,
  selectedProjectId,
  projectOptions,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onChangeProject,
}: AgendaHeaderProps) => {
  return (
    <header
      className="flex flex-col gap-4 rounded-xl border border-zinc-700
      bg-zinc-900 p-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <h2 className="text-2xl font-bold text-zinc-100">Agenda</h2>

        <p className="mt-1 text-sm font-semibold text-zinc-200">
          {getMonthTitle(currentMonth)}
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <AgendaProjectFilter
          selectedProjectId={selectedProjectId}
          projectOptions={projectOptions}
          onChangeProject={onChangeProject}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onPreviousMonth}
            className="rounded-md bg-zinc-800 p-2 text-zinc-100 duration-150 hover:bg-zinc-700"
            title="Mês anterior"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            type="button"
            onClick={onToday}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white
            duration-150 hover:bg-accent"
          >
            Hoje
          </button>

          <button
            type="button"
            onClick={onNextMonth}
            className="rounded-md bg-zinc-800 p-2 text-zinc-100 duration-150 hover:bg-zinc-700"
            title="Próximo mês"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};
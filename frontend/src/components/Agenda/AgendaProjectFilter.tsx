import type { AgendaProjectOption } from "./AgendaHeader";

type AgendaProjectFilterProps = {
  selectedProjectId: string;
  projectOptions: AgendaProjectOption[];
  onChangeProject: (projectId: string) => void;
};

export const AgendaProjectFilter = ({
  selectedProjectId,
  projectOptions,
  onChangeProject,
}: AgendaProjectFilterProps) => {
  return (
    <label className="flex min-w-56 flex-col gap-1 text-sm text-zinc-400">
      Filtrar por projeto

      <select
        value={selectedProjectId}
        onChange={(e) => onChangeProject(e.target.value)}
        className="rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2
        text-sm text-zinc-100 outline-none duration-150 focus:border-accent"
      >
        <option value="all">Todos os projetos</option>

        {projectOptions.map((project) => (
          <option key={project.id} value={project.id}>
            {project.title}
          </option>
        ))}
      </select>
    </label>
  );
};
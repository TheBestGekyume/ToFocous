import type { TProject } from "../../types/TProject";

type KanbanProjectSelectProps = {
  projects: TProject[];
  selectedProjectId: string;
  onChangeProject: (projectId: string) => void;
};

export const KanbanProjectSelect = ({
  projects,
  selectedProjectId,
  onChangeProject,
}: KanbanProjectSelectProps) => {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="kanban-project"
        className="font-medium text-text/75 text-sm"
      >
        Projeto
      </label>

      <select
        id="kanban-project"
        value={selectedProjectId}
        onChange={(event) => onChangeProject(event.target.value)}
        className="
          h-10 rounded-md border border-zinc-700 bg-zinc-950
          px-3 py-2 text-text outline-none duration-150
          hover:bg-zinc-900 focus:bg-zinc-950 focus:border-accent
        "
      >
        {projects.map((project) => (
          <option
            key={project.id}
            value={project.id}
            className="text-text"
          >
            {project.title}
          </option>
        ))}
      </select>
    </div>
  );
};  
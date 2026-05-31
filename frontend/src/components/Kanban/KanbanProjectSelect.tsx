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
        className="font-bold   text-primary text-sm"
      >
        Projeto
      </label>

      <select
        id="kanban-project"
        value={selectedProjectId}
        onChange={(event) => onChangeProject(event.target.value)}
        className="
          h-10 rounded-md border border-secondary/30 bg-background-header
          px-3 text-text outline-none duration-100
          hover:border-secondary focus:border-accent
        "
      >
        {projects.map((project) => (
          <option
            key={project.id}
            value={project.id}
            className="bg-background-header text-text"
          >
            {project.title}
          </option>
        ))}
      </select>
    </div>
  );
};  
import type { TProject } from "../../types/TProject";
import { KanbanProjectSelect } from "./KanbanProjectSelect";

type Props = {
  projects: TProject[];
  selectedProjectId: string;
  onChangeProject: (projectId: string) => void;
};

export const KanbanHeader = ({
  projects,
  selectedProjectId,
  onChangeProject,
}: Props) => {
  return (
    <header className="flex flex-col gap-4 rounded-2xl bg-background-header p-6 shadow-md md:flex-row md:items-center md:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-text">Kanban</h2>

        <p className="mt-1 text-sm text-primary font-semibold">
          Organize as tarefas principais por status dentro de um projeto.
        </p>
      </div>

      {projects.length > 0 && (
        <KanbanProjectSelect
          projects={projects}
          selectedProjectId={selectedProjectId}
          onChangeProject={onChangeProject}
        />
      )}
    </header>
  );
};

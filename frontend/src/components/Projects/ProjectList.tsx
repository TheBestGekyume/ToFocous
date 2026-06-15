import { useProjects } from "../../hooks/useProjects";
import type { TProject } from "../../types/TProject";
import { ProjectItem } from "./ProjectItem";

type Props = {
  onEdit: (project: TProject) => void;
};

export const ProjectList = ({ onEdit }: Props) => {
  const { projects } = useProjects();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr gap-4 mt-4 mb-10">
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
};

import { useProjects } from "../../hooks/useProjects";
import type { TProject } from "../../types/TProject";
import { ProjectItem } from "./ProjectItem";

type Props = {
  onEdit: (project: TProject) => void;
};

export const ProjectList = ({ onEdit }: Props) => {
  const { projects } = useProjects();

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 mt-4 mb-10">
      {projects.map((project) => (
        <div key={project.id} className="mb-4 break-inside-avoid">
          <ProjectItem project={project} onEdit={onEdit} />
        </div>
      ))}
    </div>
  );
};

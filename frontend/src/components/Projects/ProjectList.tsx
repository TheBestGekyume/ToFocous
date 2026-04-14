import { useProjects } from "../../hooks/useProjects";
import type { TProject } from "../../types/TProject";
import { ProjectItem } from "./ProjectItem";

type Props = {
  onEdit: (project: TProject) => void;
};

export const ProjectList = ({ onEdit }: Props) => {
  const { projects } = useProjects();
  console.log(projects);
  projects.map((p) => console.log(p.id));

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 mt-4">
      {projects.map((project) => (
        <div className="mb-4 break-inside-avoid">
          <ProjectItem
            key={project.id}
            project={project}
            onEdit={onEdit}
          />
        </div>
      ))}
    </div>
  );
};

import { useProjects } from "../../hooks/useProjects";
import type { TProject } from "../../types/TProject";
import { ProjectItem } from "./ProjectItem";

type Props = {
  onEdit: (project: TProject) => void;
};

export const ProjectList = ({ onEdit }: Props) => {
  const { projects } = useProjects();
  

  if (!projects || projects.length === 0) {
    return (
      <p className="text-zinc-500 text-center italic py-5">
        Nenhum Projeto adicionada ainda. <br />
        Clique em{" "}
        <span className="text-green-300/70 font-medium"> + </span> acima para
        adicionar!
      </p>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 auto-rows-fr gap-4 mt-4 mb-10">
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} onEdit={onEdit} />
      ))}
    </div>
  );
};

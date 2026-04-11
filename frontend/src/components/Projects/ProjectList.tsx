import { useProjects } from "../../hooks/useProjects";
import { ProjectItem } from "./ProjectItem";

export const ProjectList = () => {
  const { projects, loading } = useProjects();

  if (loading) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {projects?.length > 0 ? (
        projects.map((project) => (
          <ProjectItem key={project.id} project={project} />
        ))
      ) : (
        <p className="text-zinc-500 text-center italic">
          Nenhum projeto encontrado.
        </p>
      )}
    </div>
  );
};

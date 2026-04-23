import { useEffect, useState } from "react";
import { ProjectsContext } from "../contexts/ProjectsContext";
import { projectService } from "../services/projectService";
import type {
  TCreateProjectDTO,
  TProject,
  TUpdateProjectDTO,
} from "../types/TProject";

export const ProjectsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [projects, setProjects] = useState<TProject[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = async (): Promise<TProject[]> => {
    setLoading(true);
    try {
      const data = await projectService.getAllProjects();
      setProjects(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const getProjectById = async (id: string): Promise<TProject> => {
    const existingProject = projects.find((p) => p.id === id);

    if (existingProject) {
      return existingProject;
    }

    setLoading(true);

    try {
      const data = await projectService.getProjectById(id);

      setProjects((prev) => [...prev, data]);

      return data;
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (payload: TCreateProjectDTO) => {
    const newProject = await projectService.createProject(payload);
    setProjects((prev) => [...prev, newProject]);
  };

  const updateProject = async (id: string, payload: TUpdateProjectDTO) => {
    const updated = await projectService.updateProject(id, payload);

    setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));

    return updated;
  };

  const deleteProject = async (id: string) => {
    await projectService.deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        loading,
        fetchProjects,
        getProjectById,
        createProject,
        updateProject,
        deleteProject,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
};

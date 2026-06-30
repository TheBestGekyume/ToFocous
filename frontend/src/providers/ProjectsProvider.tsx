import { useCallback, useEffect, useState } from "react";
import { ProjectsContext } from "../contexts/ProjectsContext";
import { projectService } from "../services/projects/projectService";
import type {
  TCreateProjectDTO,
  TProject,
  TUpdateProjectDTO,
} from "../types/TProject";
import { logApiError } from "../utils/apiError";

const upsertProject = (list: TProject[], project: TProject): TProject[] => {
  const alreadyExists = list.some((item) => item.id === project.id);

  if (alreadyExists) {
    return list.map((item) => (item.id === project.id ? project : item));
  }

  return [...list, project];
};

const removeDuplicatedProjects = (list: TProject[]): TProject[] => {
  const map = new Map<string, TProject>();

  list.forEach((project) => {
    map.set(project.id, project);
  });

  return Array.from(map.values());
};

export const ProjectsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [projects, setProjects] = useState<TProject[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async (): Promise<TProject[]> => {
    setLoading(true);

    try {
      const data = await projectService.getAllProjects();
      const uniqueProjects = removeDuplicatedProjects(data);

      setProjects(uniqueProjects);

      return uniqueProjects;
    } catch (error: unknown) {
      logApiError("Erro ao buscar projetos", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getProjectById = useCallback(
    async (id: string): Promise<TProject> => {
      const existingProject = projects.find((project) => project.id === id);

      if (existingProject) {
        return existingProject;
      }

      setLoading(true);

      try {
        const data = await projectService.getProjectById(id);

        setProjects((prev) => upsertProject(prev, data));

        return data;
      } catch (error: unknown) {
        logApiError(`Erro ao buscar projeto ${id}`, error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [projects]
  );

  const createProject = useCallback(
    async (payload: TCreateProjectDTO): Promise<TProject> => {
      try {
        const newProject = await projectService.createProject(payload);

        setProjects((prev) => upsertProject(prev, newProject));

        return newProject;
      } catch (error: unknown) {
        logApiError("Erro ao criar projeto", error);
        throw error;
      }
    },
    []
  );

  const updateProject = useCallback(
    async (id: string, payload: TUpdateProjectDTO): Promise<TProject> => {
      try {
        const updated = await projectService.updateProject(id, payload);

        setProjects((prev) => upsertProject(prev, updated));

        return updated;
      } catch (error: unknown) {
        logApiError(`Erro ao atualizar projeto ${id}`, error);
        throw error;
      }
    },
    []
  );

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      await projectService.deleteProject(id);

      setProjects((prev) => prev.filter((project) => project.id !== id));
    } catch (error: unknown) {
      logApiError(`Erro ao deletar projeto ${id}`, error);
      throw error;
    }
  }, []);

  useEffect(() => {
    void fetchProjects().catch(() => undefined);
  }, [fetchProjects]);

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
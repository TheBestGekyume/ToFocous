import { createContext } from "react";
import type {
  TCreateProjectDTO,
  TProject,
  TUpdateProjectDTO,
} from "../types/TProject";

export type ProjectsContextType = {
  projects: TProject[];
  loading: boolean;

  fetchProjects: () => Promise<void>;
  createProject: (data: TCreateProjectDTO) => Promise<void>;
  updateProject: (id: string, data: TUpdateProjectDTO) => Promise<TProject>;
  deleteProject: (id: string) => Promise<void>;
};

export const ProjectsContext =
  createContext<ProjectsContextType | undefined>(undefined);
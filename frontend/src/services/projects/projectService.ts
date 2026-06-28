import { api } from "../api/api";
import type { TCreateProjectDTO, TProject, TUpdateProjectDTO } from "../../types/TProject";
import { requireApiContent, type TApiResponse } from "../../types/TApi";

type ProjectListResponse = {
  projects: TProject[];
};


export const projectService = {

  async getProjectById(id: string): Promise<TProject> {
    const response = await api.get(`/projects/${id}/`);
    return requireApiContent(response.data);
  },

  async getAllProjects(): Promise<TProject[]> {
    const response = await api.get<TApiResponse<ProjectListResponse>>("/projects/");
    return requireApiContent(response.data).projects;
  },

  async createProject(payload: TCreateProjectDTO): Promise<TProject> {
    const response = await api.post("/projects/", payload);
    return requireApiContent(response.data);
  },

  async updateProject(id: string, payload: TUpdateProjectDTO): Promise<TProject> {
    const response = await api.patch(`/projects/${id}/`, payload);
    return requireApiContent(response.data);
  },

  async deleteProject(id: string): Promise<void> {
    const response = await api.delete(`/projects/${id}/`);
    return requireApiContent(response.data);
  },
};
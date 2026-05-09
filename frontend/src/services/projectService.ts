import { api } from "./api";
import type { TCreateProjectDTO, TProject, TUpdateProjectDTO } from "../types/TProject";

export const projectService = {

  async getProjectById(id: string): Promise<TProject> {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  async getAllProjects(): Promise<TProject[]> {
    const { data } = await api.get("/projects/"); 
    return data;
  },

  async createProject(payload: TCreateProjectDTO): Promise<TProject> {
    const { data } = await api.post("/projects/", payload);
    return data.data;
  },

  async updateProject(id: string, payload: TUpdateProjectDTO): Promise<TProject> {
    const { data } = await api.patch(`/projects/${id}`, payload);
    return data.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
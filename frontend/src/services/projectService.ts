import { api } from "./api";
import type { TCreateProjectDTO, TProject, TUpdateProjectDTO } from "../types/TProject";

export const projectService = {
  async getAll(): Promise<TProject[]> {
    const { data } = await api.get("/projects/");
    return data;
  },

  async create(payload: TCreateProjectDTO): Promise<TProject> {
    const { data } = await api.post("/projects/", payload);
    return data.data;
  },

  async update(id: string, payload: TUpdateProjectDTO): Promise<TProject> {
    const { data } = await api.patch(`/projects/${id}`, payload);
    return data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },
};
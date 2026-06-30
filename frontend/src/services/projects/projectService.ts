import { api } from "../api/api";
import type {
  TCreateProjectDTO,
  TProject,
  TUpdateProjectDTO,
} from "../../types/TProject";
import { getApiSuccessOrThrow, type TApiResponse } from "../../types/TApi";

type ProjectListResponse = {
  projects: TProject[];
};

export const projectService = {
  async getProjectById(id: string): Promise<TProject> {
    const response = await api.get<TApiResponse<TProject>>(`/projects/${id}/`);

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async getAllProjects(): Promise<TProject[]> {
    const response = await api.get<TApiResponse<ProjectListResponse>>(
      "/projects/"
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.projects;
  },

  async createProject(payload: TCreateProjectDTO): Promise<TProject> {
    const response = await api.post<TApiResponse<TProject>>(
      "/projects/",
      payload
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async updateProject(
    id: string,
    payload: TUpdateProjectDTO
  ): Promise<TProject> {
    const response = await api.patch<TApiResponse<TProject>>(
      `/projects/${id}/`,
      payload
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async deleteProject(id: string): Promise<void> {
    const response = await api.delete<TApiResponse<unknown>>(
      `/projects/${id}/`
    );

    getApiSuccessOrThrow(response.data);
  },
};
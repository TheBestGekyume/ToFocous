import { authenticatedApi } from "../api/api";
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
    const response = await authenticatedApi.get<TApiResponse<TProject>>(`/projects/${id}/`);

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async getAllProjects(): Promise<TProject[]> {
    const response = await authenticatedApi.get<TApiResponse<ProjectListResponse>>(
      "/projects/"
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.projects;
  },

  async createProject(payload: TCreateProjectDTO): Promise<TProject> {
    const response = await authenticatedApi.post<TApiResponse<TProject>>(
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
    const response = await authenticatedApi.patch<TApiResponse<TProject>>(
      `/projects/${id}/`,
      payload
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async deleteProject(id: string): Promise<void> {
    const response = await authenticatedApi.delete<TApiResponse<unknown>>(
      `/projects/${id}/`
    );

    getApiSuccessOrThrow(response.data);
  },
};
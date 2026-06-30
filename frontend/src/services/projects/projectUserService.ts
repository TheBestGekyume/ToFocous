import { api } from "../api/api";
import type {
  TAddProjectUserDTO,
  TProjectUser,
  TRemoveProjectUserDTO,
} from "../../types/TProjectUser";
import { getApiSuccessOrThrow, type TApiResponse } from "../../types/TApi";

type ProjectUsersListResponse = {
  users: TProjectUser[];
};

export const projectUserService = {
  async getProjectUsers(projectId: string): Promise<TProjectUser[]> {
    const response = await api.get<TApiResponse<ProjectUsersListResponse>>(
      `/project-users/${projectId}/`
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.users;
  },

  async addProjectUser(payload: TAddProjectUserDTO): Promise<TProjectUser> {
    const response = await api.post<TApiResponse<TProjectUser>>(
      "/project-users/",
      payload
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async removeProjectUser(payload: TRemoveProjectUserDTO): Promise<void> {
    const response = await api.delete<TApiResponse<unknown>>(
      "/project-users/",
      {
        data: payload,
      }
    );

    getApiSuccessOrThrow(response.data);
  },

  async leaveProject(projectId: string): Promise<void> {
    const response = await api.delete<TApiResponse<unknown>>(
      `/project-users/leave/${projectId}/`
    );

    getApiSuccessOrThrow(response.data);
  },
};
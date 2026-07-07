import { authenticatedApi } from "../api/api";
import type {
  TAddProjectUserDTO,
  TProjectUser,
  TRemoveProjectUserDTO,
} from "../../types/TProjectUser";
import { getApiSuccessOrThrow, type TApiResponse } from "../../types/TApi";

type ProjectUsersListResponse = {
  users: TProjectUser[];
};

type ServiceResult<T> = {
  content: T;
  message: string;
};

export const projectUserService = {
  async getProjectUsers(projectId: string): Promise<TProjectUser[]> {
    const response = await authenticatedApi.get<
      TApiResponse<ProjectUsersListResponse>
    >(`/project-users/${projectId}/`);

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.users;
  },

  async addProjectUser(
    payload: TAddProjectUserDTO
  ): Promise<ServiceResult<TProjectUser>> {
    const response = await authenticatedApi.post<TApiResponse<TProjectUser>>(
      "/project-users/",
      payload
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return {
      content: success.content,
      message: success.message,
    };
  },

  async removeProjectUser(
    payload: TRemoveProjectUserDTO
  ): Promise<string> {
    const response = await authenticatedApi.delete<TApiResponse<unknown>>(
      "/project-users/",
      {
        data: payload,
      }
    );

    const success = getApiSuccessOrThrow(response.data);

    return success.message;
  },

  async leaveProject(projectId: string): Promise<string> {
    const response = await authenticatedApi.delete<TApiResponse<unknown>>(
      `/project-users/leave/${projectId}/`
    );

    const success = getApiSuccessOrThrow(response.data);

    return success.message;
  },
};
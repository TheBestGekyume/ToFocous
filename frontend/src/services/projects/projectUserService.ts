import { api } from "../api/api";
import type {
  TAddProjectUserDTO,
  TProjectUser,
  TRemoveProjectUserDTO,
} from "../../types/TProjectUser";
import type { TApiResponse } from "../../types/TApi";
import { requireApiContent } from "../../types/TApi";

type ProjectUsersListResponse = {
  users: TProjectUser[];
};


export const projectUserService = {
  async getProjectUsers(projectId: string): Promise<TProjectUser[]> {
    const response = await api.get<TApiResponse<ProjectUsersListResponse>>(
      `/project-users/${projectId}/`
    );

    return requireApiContent(response.data).users;
  },

  async addProjectUser(payload: TAddProjectUserDTO): Promise<TProjectUser> {
    const response = await api.post<TApiResponse<TProjectUser>>(
      "/project-users/",
      payload
    );

    return requireApiContent(response.data);
  },

  async removeProjectUser(payload: TRemoveProjectUserDTO): Promise<void> {
    await api.delete<TApiResponse<ProjectUsersListResponse>>(
      "/project-users/",
      {
        data: payload,
      }
    );
  },

  async leaveProject(projectId: string): Promise<void> {
    await api.delete<TApiResponse<ProjectUsersListResponse>>(
      `/project-users/leave/${projectId}/`
    );
  },
};
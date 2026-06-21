import { api } from "../api/api";
import type {
  TAddProjectUserDTO,
  TProjectUser,
  TRemoveProjectUserDTO,
} from "../../types/TProjectUser";

type ApiResponse<T> = {
  data: T;
};

export const projectUserService = {
  async getProjectUsers(projectId: string): Promise<TProjectUser[]> {
    const { data } = await api.get<ApiResponse<TProjectUser[]>>(
      `/project-users/${projectId}/`
    );

    return data.data;
  },

  async addProjectUser(payload: TAddProjectUserDTO): Promise<TProjectUser> {
    const { data } = await api.post<ApiResponse<TProjectUser>>(
      "/project-users/",
      payload
    );

    return data.data;
  },

  async removeProjectUser(payload: TRemoveProjectUserDTO): Promise<void> {
    await api.delete("/project-users/", {
      data: payload,
    });
  },

  async leaveProject(projectId: string): Promise<void> {
    await api.delete(`/project-users/leave/${projectId}/`);
  },
};
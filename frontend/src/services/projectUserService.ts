import { api } from "./api";
import type {
  TAddProjectUserDTO,
  TProjectUser,
  TRemoveProjectUserDTO,
} from "../types/TProjectUser";

export const projectUserService = {
  async getProjectUsers(projectId: string): Promise<TProjectUser[]> {
    const { data } = await api.get(`/project-users/${projectId}`);
    console.log(data.data)
    return data.data;
  },

  async addProjectUser(payload: TAddProjectUserDTO): Promise<TProjectUser> {
    const { data } = await api.post("/project-users/", payload);
    return data.data;
  },

  async removeProjectUser(payload: TRemoveProjectUserDTO): Promise<void> {
    await api.delete("/project-users/", {
      data: payload,
    });
  },
};
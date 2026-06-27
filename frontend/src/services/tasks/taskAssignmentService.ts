import { api } from "../api/api";
import type {
  TCreateTaskAssignmentDTO,
  TDeleteTaskAssignmentDTO,
  TTaskAssignment,
} from "../../types/TTaskAssignment";

type ApiResponse<T> = {
  message: string;
  data: T;
};

export const taskAssignmentService = {
  async getProjectAssignments(projectId: string): Promise<TTaskAssignment[]> {
    const response = await api.get<ApiResponse<TTaskAssignment[]>>(
      `/task-assignments/project/${projectId}/`
    );

    return response.data.data;
  },

  async getTaskAssignments(taskId: string): Promise<TTaskAssignment[]> {
    const response = await api.get<ApiResponse<TTaskAssignment[]>>(
      `/task-assignments/task/${taskId}/`
    );

    return response.data.data;
  },

  async getSubTaskAssignments(subtaskId: string): Promise<TTaskAssignment[]> {
    const response = await api.get<ApiResponse<TTaskAssignment[]>>(
      `/task-assignments/subtask/${subtaskId}/`
    );

    return response.data.data;
  },

  async createAssignment(
    payload: TCreateTaskAssignmentDTO
  ): Promise<TTaskAssignment> {
    const response = await api.post<ApiResponse<TTaskAssignment>>(
      "/task-assignments/",
      payload
    );

    return response.data.data;
  },

  async deleteAssignment(payload: TDeleteTaskAssignmentDTO): Promise<void> {
    await api.delete<ApiResponse<TTaskAssignment[]>>("/task-assignments/", {
      data: payload,
    });
  },
};
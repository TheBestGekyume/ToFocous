import { authenticatedApi } from "../api/api";
import type {
  TCreateTaskAssignmentDTO,
  TDeleteTaskAssignmentDTO,
  TTaskAssignment,
} from "../../types/TTaskAssignment";
import { getApiSuccessOrThrow, type TApiResponse } from "../../types/TApi";

type TaskAssignmentListResponse = {
  assignments: TTaskAssignment[];
};

export const taskAssignmentService = {
  async getProjectAssignments(projectId: string): Promise<TTaskAssignment[]> {
    const response = await authenticatedApi.get<TApiResponse<TaskAssignmentListResponse>>(
      `/task-assignments/project/${projectId}/`
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.assignments;
  },

  async getTaskAssignments(taskId: string): Promise<TTaskAssignment[]> {
    const response = await authenticatedApi.get<TApiResponse<TaskAssignmentListResponse>>(
      `/task-assignments/task/${taskId}/`
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.assignments;
  },

  async getSubTaskAssignments(subtaskId: string): Promise<TTaskAssignment[]> {
    const response = await authenticatedApi.get<TApiResponse<TaskAssignmentListResponse>>(
      `/task-assignments/subtask/${subtaskId}/`
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.assignments;
  },

  async createAssignment(
    payload: TCreateTaskAssignmentDTO
  ): Promise<TTaskAssignment> {
    const response = await authenticatedApi.post<TApiResponse<TTaskAssignment>>(
      "/task-assignments/",
      payload
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async deleteAssignment(payload: TDeleteTaskAssignmentDTO): Promise<void> {
    const response = await authenticatedApi.delete<TApiResponse<unknown>>(
      "/task-assignments/",
      {
        data: payload,
      }
    );

    getApiSuccessOrThrow(response.data);
  },
};
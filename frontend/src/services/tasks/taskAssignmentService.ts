import { api } from "../api/api";
import type {
  TCreateTaskAssignmentDTO,
  TDeleteTaskAssignmentDTO,
  TTaskAssignment,
} from "../../types/TTaskAssignment";
import { requireApiContent, type TApiResponse } from "../../types/TApi";

type TaskAssignmentListResponse = {
  assignments: TTaskAssignment[];
};

export const taskAssignmentService = {
  async getProjectAssignments(projectId: string): Promise<TTaskAssignment[]> {
    const response = await api.get<TApiResponse<TaskAssignmentListResponse>>(
      `/task-assignments/project/${projectId}/`
    );
    return requireApiContent(response.data).assignments;

  },

  async getTaskAssignments(taskId: string): Promise<TTaskAssignment[]> {
    const response = await api.get<TApiResponse<TTaskAssignment[]>>(
      `/task-assignments/task/${taskId}/`
    );

    return requireApiContent(response.data);
  },

  async getSubTaskAssignments(subtaskId: string): Promise<TTaskAssignment[]> {
    const response = await api.get<TApiResponse<TTaskAssignment[]>>(
      `/task-assignments/subtask/${subtaskId}/`
    );

    return requireApiContent(response.data);
  },

  async createAssignment(
    payload: TCreateTaskAssignmentDTO
  ): Promise<TTaskAssignment> {
    const response = await api.post<TApiResponse<TTaskAssignment>>(
      "/task-assignments/",
      payload
    );

    return requireApiContent(response.data);

  },

  async deleteAssignment(payload: TDeleteTaskAssignmentDTO): Promise<TTaskAssignment[]> {
    const response = await api.delete<TApiResponse<TTaskAssignment[]>>("/task-assignments/", {
      data: payload,
    });
    return requireApiContent(response.data);

  },


};
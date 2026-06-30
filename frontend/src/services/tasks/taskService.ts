import { api } from "../api/api";
import type { TApiResponse } from "../../types/TApi";
import { getApiSuccessOrThrow } from "../../types/TApi";

import type {
  TTask,
  TCreateTaskDTO,
  TUpdateTaskDTO,
  TSubTask,
  TCreateSubTaskDTO,
  TUpdateSubTaskDTO,
} from "../../types/TTask";

type TaskListResponse = {
  tasks: TTask[];
};

type SubTaskListResponse = {
  subtasks: TSubTask[];
};

export const taskService = {
  // TASKS

  async getTasksByProject(projectId: string): Promise<TTask[]> {
    const response = await api.get<TApiResponse<TaskListResponse>>("/tasks/", {
      params: { project_id: projectId },
    });

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.tasks;
  },

  async getTasks(): Promise<TTask[]> {
    const response = await api.get<TApiResponse<TaskListResponse>>("/tasks/");

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.tasks;
  },

  async createTask(data: TCreateTaskDTO): Promise<TTask> {
    const response = await api.post<TApiResponse<TTask>>("/tasks/", data);

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async updateTask(id: string, data: TUpdateTaskDTO): Promise<TTask> {
    const response = await api.patch<TApiResponse<TTask>>(
      `/tasks/${id}/`,
      data
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async deleteTask(id: string): Promise<void> {
    const response = await api.delete<TApiResponse<unknown>>(`/tasks/${id}/`);

    getApiSuccessOrThrow(response.data);
  },

  // SUBTASKS

  async getSubTasks(taskId: string): Promise<TSubTask[]> {
    const response = await api.get<TApiResponse<SubTaskListResponse>>(
      `/subtasks/${taskId}/`
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content.subtasks;
  },

  async createSubTask(
    taskId: string,
    data: TCreateSubTaskDTO
  ): Promise<TSubTask> {
    const response = await api.post<TApiResponse<TSubTask>>(
      `/subtasks/${taskId}/`,
      data
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async updateSubTask(
    subtaskId: string,
    taskId: string,
    data: TUpdateSubTaskDTO
  ): Promise<TSubTask> {
    const response = await api.patch<TApiResponse<TSubTask>>(
      `/subtasks/${subtaskId}/`,
      data,
      {
        params: { task_id: taskId },
      }
    );

    const success = getApiSuccessOrThrow(response.data, {
      contentRequired: true,
    });

    return success.content;
  },

  async deleteSubTask(subtaskId: string, taskId: string): Promise<void> {
    const response = await api.delete<TApiResponse<unknown>>(
      `/subtasks/${subtaskId}/`,
      {
        params: { task_id: taskId },
      }
    );

    getApiSuccessOrThrow(response.data);
  },
};
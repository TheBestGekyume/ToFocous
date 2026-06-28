import { api } from "../api/api";
import type { TApiResponse } from "../../types/TApi";
import { requireApiContent } from "../../types/TApi";

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

    return requireApiContent(response.data).tasks;
  },

  async getTasks(): Promise<TTask[]> {
    const response = await api.get<TApiResponse<TaskListResponse>>("/tasks/");

    return requireApiContent(response.data).tasks;
  },

  async createTask(data: TCreateTaskDTO): Promise<TTask> {
    const response = await api.post<TApiResponse<TTask>>("/tasks/", data);

    return requireApiContent(response.data);
  },

  async updateTask(id: string, data: TUpdateTaskDTO): Promise<TTask> {
    const response = await api.patch<TApiResponse<TTask>>(
      `/tasks/${id}/`,
      data
    );

    return requireApiContent(response.data);
  },

  async deleteTask(id: string): Promise<void> {
    const response = await api.delete<TApiResponse<TaskListResponse>>(
      `/tasks/${id}/`
    );

    requireApiContent(response.data);
  },

  // SUBTASKS

  async getSubTasks(taskId: string): Promise<TSubTask[]> {
    const response = await api.get<TApiResponse<SubTaskListResponse>>(
      `/subtasks/${taskId}/`
    );

    return requireApiContent(response.data).subtasks;
  },

  async createSubTask(
    taskId: string,
    data: TCreateSubTaskDTO
  ): Promise<TSubTask> {
    const response = await api.post<TApiResponse<TSubTask>>(
      `/subtasks/${taskId}/`,
      data
    );

    return requireApiContent(response.data);
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

    return requireApiContent(response.data);
  },

  async deleteSubTask(subtaskId: string, taskId: string): Promise<void> {
    const response = await api.delete<TApiResponse<TaskListResponse>>(
      `/subtasks/${subtaskId}/`,
      {
        params: { task_id: taskId },
      }
    );

    requireApiContent(response.data);
  },
};
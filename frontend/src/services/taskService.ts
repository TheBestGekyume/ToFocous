import { api } from "./api";

import type { TTask, TCreateTaskDTO, TSubTask, TCreateSubTaskDTO } from "../types/TTask";

export const taskService = {

  //TAKS

  async getTasksByProject(projectId: string) {
    const { data } = await api.get(`/projects/${projectId}/tasks`);
    return data;
  },

  async getTasks(): Promise<TTask[]> {
    const res = await api.get("/tasks");
    return res.data;
  },

  async createTask(data: TCreateTaskDTO): Promise<TTask> {
    const res = await api.post("/tasks", data);
    return res.data.data;
  },

  async updateTask(id: string, data: Partial<TTask>): Promise<TTask> {
    const res = await api.patch(`/tasks/${id}`, data);
    return res.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },


  //SUBTASKS

  async getSubTasks(taskId: string) {
    const res = await api.get(`/subtasks/${taskId}`);
    return res.data;
  },

  async createSubTask(taskId: string, data: TCreateSubTaskDTO): Promise<TSubTask> {
    const res = await api.post(`/subtasks/${taskId}`, data);
    return res.data.data;
  },

  async updateSubTask(subtaskId: string, taskId: string, data: Partial<TSubTask>) {
    const res = await api.patch(`/subtasks/${subtaskId}`, data, {
      params: { task_id: taskId },
    });
    return res.data.data;
  },

  async deleteSubTask(subtaskId: string, taskId: string) {
    const res = await api.delete(`/subtasks/${subtaskId}`, {
      params: { task_id: taskId },
    });
    return res.data.message;
  }

};





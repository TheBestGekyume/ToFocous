import { api } from "./api";

import type { TTask, TCreateTaskDTO, /*TSubTask*/ } from "../types/TTask";

export const taskService = {
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
    console.log("updateTask response = ", res);
    return res.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  //   async createSubtask(taskId: string, data: Partial<TSubTask>) {
  //     const res = await api.post(`/tasks/${taskId}/subtasks`, data);
  //     return res.data;
  //   },
};
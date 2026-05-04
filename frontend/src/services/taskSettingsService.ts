import { api } from "../services/api";
import type { ITaskSettings } from "../types/TSettings";

export async function getTaskSettings(): Promise<ITaskSettings> {
  const res = await api.get("/settings");
  return res.data;
}

export async function updateTaskSettings(
  data: ITaskSettings
): Promise<ITaskSettings> {
  const res = await api.patch("/settings", data);
  return res.data;
}
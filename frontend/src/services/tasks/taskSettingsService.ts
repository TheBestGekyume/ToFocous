import { api } from "../api/api";
import type { ITaskSettings } from "../../types/TSettings";
import { requireApiContent } from "../../types/TApi";

export async function getTaskSettings(): Promise<ITaskSettings> {
  const response = await api.get("/settings/");
  return requireApiContent(response.data);
}

export async function updateTaskSettings(
  data: ITaskSettings
): Promise<ITaskSettings> {
  const response = await api.patch("/settings/", data);
  return requireApiContent(response.data);
}
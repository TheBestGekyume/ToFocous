import { api } from "../api/api";
import type { TApiResponse } from "../../types/TApi";
import { getApiSuccessOrThrow } from "../../types/TApi";
import type { ITaskSettings } from "../../types/TSettings";

export async function getTaskSettings(): Promise<ITaskSettings> {
  const response = await api.get<TApiResponse<ITaskSettings>>("/settings/");

  const success = getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });

  return success.content;
}

export async function updateTaskSettings(
  data: Partial<ITaskSettings>
): Promise<ITaskSettings> {
  const response = await api.patch<TApiResponse<ITaskSettings>>(
    "/settings/",
    data
  );

  const success = getApiSuccessOrThrow(response.data, {
    contentRequired: true,
  });

  return success.content;
}
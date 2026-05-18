import { api } from "./api";

export const wakeUpApi = async (): Promise<void> => {
  await api.get("/health/");
};
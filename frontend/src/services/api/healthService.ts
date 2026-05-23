import { api } from "./api";

export const health = async (): Promise<void> => {
  await api.get("/health/");
};
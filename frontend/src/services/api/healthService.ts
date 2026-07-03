import { publicApi } from "./api";

export const health = async () => {
  const response = await publicApi.get("/health/");
  return response.data;
};
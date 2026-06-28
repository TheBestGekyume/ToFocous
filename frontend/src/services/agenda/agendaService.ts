import { requireApiContent, type TApiResponse } from "../../types/TApi";
import type { TPriority, TStatus } from "../../types/TTask";
import { api } from "../api/api";

export type AgendaItemType = "task" | "subtask";
export type AgendaDateType = "start_date" | "due_date";

export type AgendaItemResponse = {
  id: string;
  type: AgendaItemType;
  taskId: string;
  projectId: string;
  projectTitle: string | null;
  parentTitle: string | null;
  title: string;
  status: TStatus;
  priority: TPriority;
  date: string;
  dateType: AgendaDateType;
};

type AgendaResponse = {
  year: number;
  month: number;
  items: AgendaItemResponse[];
};

type GetAgendaItemsParams = {
  year: number;
  month: number;
  projectId?: string;
};

export const getAgendaItems = async ({
  year,
  month,
  projectId,
}: GetAgendaItemsParams): Promise<AgendaItemResponse[]> => {
  const response = await api.get<TApiResponse<AgendaResponse>>("/agenda/", {
    params: {
      year,
      month,
      ...(projectId ? { project_id: projectId } : {}),
    },
  });

  console.log("response =>", response)

 return requireApiContent(response.data).items;

  // const content = requireApiContent(response.data);

  // return content.items;
};
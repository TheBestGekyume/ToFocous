import { CheckCircle, Clock, AlertCircle } from "lucide-react";
import type { TTask, TStatus, TPriority } from "../types/TTask";
import type { JSX } from "react";

export const PRIORITY_ORDER: Record<TPriority, number> = {
  high: 1,
  medium: 2,
  low: 3,
};

export const STATUS_ORDER: Record<TStatus, number> = {
  unstarted: 1,
  inProgress: 2,
  concluded: 3,
};

type PriorityMapItem = {
  label: string;
  color: string;
  border: string;
};

type StatusMapItem = {
  label: string;
  color: string;
  bg: string;
  icon: JSX.Element;
};

export const priorityMap: Record<TPriority, PriorityMapItem> = {
  high: {
    label: "Alta",
    color: "text-red-300",
    border: "border-red-400",
  },
  medium: {
    label: "Média",
    color: "text-yellow-200",
    border: "border-yellow-300",
  },
  low: {
    label: "Baixa",
    color: "text-green-300",
    border: "border-green-400",
  },
};

export const statusMap: Record<TStatus, StatusMapItem> = {
  concluded: {
    label: "Concluída",
    color: "text-green-200",
    bg: "bg-green-700/50",
    icon: <CheckCircle className="text-green-200" size={18} />,
  },
  inProgress: {
    label: "Em andamento",
    color: "text-yellow-200",
    bg: "bg-yellow-700/50",
    icon: <Clock className="text-yellow-200" size={18} />,
  },
  unstarted: {
    label: "Não iniciada",
    color: "text-zinc-200",
    bg: "bg-zinc-700/50",
    icon: <AlertCircle className="text-gray-200" size={18} />,
  },
};

export const statusOptions: {
  value: TStatus;
  label: string;
  icon: JSX.Element;
}[] = [
  {
    value: "unstarted",
    label: "Não iniciada",
    icon: statusMap.unstarted.icon,
  },
  {
    value: "inProgress",
    label: "Em andamento",
    icon: statusMap.inProgress.icon,
  },
  {
    value: "concluded",
    label: "Concluída",
    icon: statusMap.concluded.icon,
  },
];

export const priorityOptions: {
  value: TPriority;
  label: string;
}[] = [
  { value: "low", label: "Baixa" },
  { value: "medium", label: "Média" },
  { value: "high", label: "Alta" },
];

export function sortTaskList(
  tasks: TTask[],
  sortConfig: {
    type: "date" | "priority" | "status" | "";
    isAscending: boolean;
  }
): TTask[] {
  if (!sortConfig.type) return tasks;

  return [...tasks].sort((a, b) => {
    switch (sortConfig.type) {
      case "date":
        return sortConfig.isAscending
          ? new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
          : new Date(b.due_date).getTime() - new Date(a.due_date).getTime();

      case "priority":
        return sortConfig.isAscending
          ? PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
          : PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];

      case "status":
        return sortConfig.isAscending
          ? STATUS_ORDER[a.status] - STATUS_ORDER[b.status]
          : STATUS_ORDER[b.status] - STATUS_ORDER[a.status];

      default:
        return 0;
    }
  });
}

export function getTimeMessage(date: string | Date) {
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const target =
    typeof date === "string"
      ? (() => {
          const [year, month, day] = date.split("-").map(Number);
          return new Date(year, month - 1, day);
        })()
      : new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        );

  const diff = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff > 1) {
    return { msg: `${diff} dias restantes!`, color: "text-blue-300" };
  }

  if (diff === 1) {
    return { msg: "Para amanhã!", color: "text-blue-400" };
  }

  if (diff === 0) {
    return { msg: "Para hoje!", color: "text-yellow-400" };
  }

  return {
    msg: `Atrasada há ${Math.abs(diff)} dias!`,
    color: "text-red-400",
  };
}

export const formatDateBR = (dateString: string): string => {
  if (!dateString) return "";

  const [year, month, day] = dateString.split("-");

  return `${day}/${month}/${year}`;
};
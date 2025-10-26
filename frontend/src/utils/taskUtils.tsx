import { CheckCircle, Clock, AlertCircle } from "lucide-react";

export const priorityMap = {
  high: { label: "Alta", color: "text-red-300", border: "border-red-400" },
  medium: { label: "Média", color: "text-yellow-200", border: "border-yellow-300" },
  low: { label: "Baixa", color: "text-green-300", border: "border-green-400" },
};

export const statusMap = {
  concluded: {
    label: "Concluída",
    color: "text-green-200",
    bg: "bg-green-700/50",
    icon: <CheckCircle className="text-green-200" size={18} />,
  },
  in_progress: {
    label: "Em andamento",
    color: "text-yellow-200",
    bg: "bg-yellow-700/50",
    icon: <Clock className="text-yellow-200" size={18} />,
  },
  not_started: {
    label: "Não iniciada",
    color: "text-zinc-200",
    bg: "bg-zinc-700/50",
    icon: <AlertCircle className="text-gray-200" size={18} />,
  },
};

export function getTimeMessage(date: Date) {
  const today = new Date();
  const diff = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diff > 1) return { msg: `${diff} dias restantes!`, color: "text-blue-300" };
  if (diff === 1) return { msg: "Para amanhã!", color: "text-blue-400" };
  if (diff === 0) return { msg: "Para hoje!", color: "text-yellow-400" };
  return { msg: `Atrasada há ${Math.abs(diff)} dias!`, color: "text-red-400" };
}

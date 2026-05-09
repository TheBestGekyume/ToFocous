import type { TWhichDateUseInCalendar } from "../types/TSettings";
import type { TPriority, TStatus, TSubTask, TTask } from "../types/TTask";

export type AgendaItemType = "task" | "subtask";
export type AgendaDateType = "start_date" | "due_date";

export type AgendaItem = {
  projectId: string;
  id: string;
  taskId: string;
  type: AgendaItemType;
  dateType: AgendaDateType;
  title: string;
  parentTitle?: string;
  date: string;
  priority: TPriority;
  status: TStatus;
};

export const agendaPriorityStyle: Record<
  TPriority,
  {
    bg: string;
    border: string;
    text: string;
    label: string;
  }
> = {
  low: {
    bg: "bg-emerald-600",
    border: "border-emerald-500",
    text: "text-emerald-300",
    label: "Baixa",
  },
  medium: {
    bg: "bg-yellow-500",
    border: "border-yellow-400",
    text: "text-yellow-300",
    label: "Média",
  },
  high: {
    bg: "bg-red-600",
    border: "border-red-500",
    text: "text-red-300",
    label: "Alta",
  },
};

export const agendaDateTypeLabel: Record<AgendaDateType, string> = {
  start_date: "Início",
  due_date: "Prazo",
};

export const formatDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export const getDateFromKey = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const getMonthTitle = (date: Date) => {
  const formatted = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(date);

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

export const getReadableDate = (dateKey: string) => {
  const date = getDateFromKey(dateKey);

  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const getMonthCalendarDays = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const firstWeekDay = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: Array<Date | null> = [];

  for (let i = 0; i < firstWeekDay; i++) {
    days.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    days.push(new Date(year, month, day));
  }

  return days;
};

const isConcluded = (status: TStatus) => {
  return status === "concluded";
};

const isValidDate = (date?: string | null): date is string => {
  return !!date && !Number.isNaN(new Date(`${date}T00:00:00`).getTime());
};

const shouldUseStartDate = (
  whichDateUseInCalendar: TWhichDateUseInCalendar
) => {
  return (
    whichDateUseInCalendar === "UseStartDate" ||
    whichDateUseInCalendar === "UseBoth"
  );
};

const shouldUseDueDate = (whichDateUseInCalendar: TWhichDateUseInCalendar) => {
  return (
    whichDateUseInCalendar === "UseDueDate" ||
    whichDateUseInCalendar === "UseBoth"
  );
};

const shouldAvoidDuplicateDate = (
  whichDateUseInCalendar: TWhichDateUseInCalendar,
  startDate: string | null,
  dueDate: string | null
) => {
  return (
    whichDateUseInCalendar === "UseBoth" &&
    !!startDate &&
    !!dueDate &&
    startDate === dueDate
  );
};

const buildTaskDateItems = (
  task: TTask,
  whichDateUseInCalendar: TWhichDateUseInCalendar
): AgendaItem[] => {
  if (isConcluded(task.status)) return [];

  const items: AgendaItem[] = [];

  const startDate = isValidDate(task.start_date) ? task.start_date : null;
  const dueDate = isValidDate(task.due_date) ? task.due_date : null;

  const avoidDuplicateDate = shouldAvoidDuplicateDate(
    whichDateUseInCalendar,
    startDate,
    dueDate
  );

  if (shouldUseStartDate(whichDateUseInCalendar) && startDate) {
    items.push({
      id: task.id,
      taskId: task.id,
      projectId: task.project_id,
      type: "task",
      dateType: "start_date",
      title: task.title,
      date: startDate,
      priority: task.priority,
      status: task.status,
    });
  }

  if (
    shouldUseDueDate(whichDateUseInCalendar) &&
    dueDate &&
    !avoidDuplicateDate
  ) {
    items.push({
      id: task.id,
      taskId: task.id,
      projectId: task.project_id,
      type: "task",
      dateType: "due_date",
      title: task.title,
      date: dueDate,
      priority: task.priority,
      status: task.status,
    });
  }

  return items;
};

const buildSubTaskDateItems = (
  task: TTask,
  subtask: TSubTask,
  whichDateUseInCalendar: TWhichDateUseInCalendar
): AgendaItem[] => {
  if (isConcluded(subtask.status)) return [];
  const items: AgendaItem[] = [];

  const startDate = isValidDate(subtask.start_date) ? subtask.start_date : null;
  const dueDate = isValidDate(subtask.due_date) ? subtask.due_date : null;

  const avoidDuplicateDate = shouldAvoidDuplicateDate(
    whichDateUseInCalendar,
    startDate,
    dueDate
  );

  if (shouldUseStartDate(whichDateUseInCalendar) && startDate) {
    items.push({
      id: subtask.id,
      taskId: task.id,
      projectId: task.project_id,
      type: "subtask",
      dateType: "start_date",
      title: subtask.title,
      parentTitle: task.title,
      date: startDate,
      priority: subtask.priority,
      status: subtask.status,
    });
  }

  if (
    shouldUseDueDate(whichDateUseInCalendar) &&
    dueDate &&
    !avoidDuplicateDate
  ) {
    items.push({
      id: subtask.id,
      taskId: task.id,
      projectId: task.project_id,
      type: "subtask",
      dateType: "due_date",
      title: subtask.title,
      parentTitle: task.title,
      date: dueDate,
      priority: subtask.priority,
      status: subtask.status,
    });
  }

  return items;
};

export const buildAgendaItems = (
  tasks: TTask[],
  whichDateUseInCalendar: TWhichDateUseInCalendar = "UseBoth"
) => {
  return tasks.flatMap((task) => [
    ...buildTaskDateItems(task, whichDateUseInCalendar),
    ...(task.subtasks ?? []).flatMap((subtask) =>
      buildSubTaskDateItems(task, subtask, whichDateUseInCalendar)
    ),
  ]);
};

export const groupAgendaItemsByDate = (items: AgendaItem[]) => {
  return items.reduce<Record<string, AgendaItem[]>>((acc, item) => {
    const currentItems = acc[item.date] ?? [];

    return {
      ...acc,
      [item.date]: [...currentItems, item],
    };
  }, {});
};

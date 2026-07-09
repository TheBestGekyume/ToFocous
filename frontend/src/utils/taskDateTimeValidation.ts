import type { ITaskSettings } from "../types/TSettings";

type DateTimeFields = {
  start_date?: string | null;
  start_time?: string | null;
  due_date?: string | null;
  due_time?: string | null;
};

const parseDateNumber = (value?: string | null): number | null => {
  if (!value) return null;

  const [year, month, day] = value.slice(0, 10).split("-").map(Number);

  if (!year || !month || !day) return null;

  return year * 10000 + month * 100 + day;
};

const parseTimeMinutes = (value?: string | null): number | null => {
  if (!value) return null;

  const [hours, minutes] = value.slice(0, 5).split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return hours * 60 + minutes;
};

const canValidateStartDate = (settings: ITaskSettings | null): boolean => {
  return Boolean(settings?.use_start_date);
};

const canValidateTime = (settings: ITaskSettings | null): boolean => {
  return Boolean(settings?.use_time);
};

const canValidateStartTime = (settings: ITaskSettings | null): boolean => {
  return Boolean(settings?.use_time && settings?.use_start_date);
};

export const validateTaskDateTime = (
  task: DateTimeFields,
  settings: ITaskSettings | null
): string | null => {
  const shouldUseStartDate = canValidateStartDate(settings);
  const shouldUseTime = canValidateTime(settings);
  const shouldUseStartTime = canValidateStartTime(settings);

  const startDate = shouldUseStartDate
    ? parseDateNumber(task.start_date)
    : null;

  const dueDate = parseDateNumber(task.due_date);

  const startTime = shouldUseStartTime
    ? parseTimeMinutes(task.start_time)
    : null;

  const dueTime = shouldUseTime
    ? parseTimeMinutes(task.due_time)
    : null;

  if (startDate && dueDate && dueDate < startDate) {
    return "A data de entrega deve ser posterior ou igual à data de início.";
  }

  if (
    startDate &&
    dueDate &&
    startDate === dueDate &&
    startTime !== null &&
    dueTime !== null &&
    dueTime <= startTime
  ) {
    return "O horário de entrega deve ser posterior ao horário de início quando as datas são iguais.";
  }

  return null;
};

export const validateSubTaskDateTime = (
  subtask: DateTimeFields,
  parentTask: DateTimeFields,
  settings: ITaskSettings | null
): string | null => {
  const shouldUseStartDate = canValidateStartDate(settings);
  const shouldUseTime = canValidateTime(settings);
  const shouldUseStartTime = canValidateStartTime(settings);

  const subtaskStartDate = shouldUseStartDate
    ? parseDateNumber(subtask.start_date)
    : null;

  const subtaskDueDate = parseDateNumber(subtask.due_date);

  const subtaskStartTime = shouldUseStartTime
    ? parseTimeMinutes(subtask.start_time)
    : null;

  const subtaskDueTime = shouldUseTime
    ? parseTimeMinutes(subtask.due_time)
    : null;

  const taskStartDate = shouldUseStartDate
    ? parseDateNumber(parentTask.start_date)
    : null;

  const taskDueDate = parseDateNumber(parentTask.due_date);

  const taskStartTime = shouldUseStartTime
    ? parseTimeMinutes(parentTask.start_time)
    : null;

  const taskDueTime = shouldUseTime
    ? parseTimeMinutes(parentTask.due_time)
    : null;

  if (
    subtaskStartDate &&
    subtaskDueDate &&
    subtaskDueDate < subtaskStartDate
  ) {
    return "A data de entrega da subtarefa deve ser posterior ou igual à data de início.";
  }

  if (
    subtaskStartDate &&
    subtaskDueDate &&
    subtaskStartDate === subtaskDueDate &&
    subtaskStartTime !== null &&
    subtaskDueTime !== null &&
    subtaskDueTime <= subtaskStartTime
  ) {
    return "O horário de entrega da subtarefa deve ser posterior ao horário de início quando as datas são iguais.";
  }

  if (taskStartDate && subtaskStartDate) {
    if (subtaskStartDate < taskStartDate) {
      return "A data de início da subtarefa não pode ser anterior à data de início da tarefa pai.";
    }

    if (
      subtaskStartDate === taskStartDate &&
      taskStartTime !== null &&
      subtaskStartTime !== null &&
      subtaskStartTime < taskStartTime
    ) {
      return "O horário de início da subtarefa não pode ser anterior ao horário de início da tarefa pai.";
    }
  }

  if (taskDueDate && subtaskDueDate) {
    if (subtaskDueDate > taskDueDate) {
      return "A data de entrega da subtarefa não pode ser posterior à data de entrega da tarefa pai.";
    }

    if (
      subtaskDueDate === taskDueDate &&
      taskDueTime !== null &&
      subtaskDueTime !== null &&
      subtaskDueTime > taskDueTime
    ) {
      return "O horário de entrega da subtarefa não pode ser posterior ao horário de entrega da tarefa pai.";
    }
  }

  if (taskDueDate && subtaskStartDate) {
    if (subtaskStartDate > taskDueDate) {
      return "A data de início da subtarefa não pode ser posterior à data de entrega da tarefa pai.";
    }

    if (
      subtaskStartDate === taskDueDate &&
      taskDueTime !== null &&
      subtaskStartTime !== null &&
      subtaskStartTime > taskDueTime
    ) {
      return "O horário de início da subtarefa não pode ser posterior ao horário de entrega da tarefa pai.";
    }
  }

  if (taskStartDate && subtaskDueDate) {
    if (subtaskDueDate < taskStartDate) {
      return "A data de entrega da subtarefa não pode ser anterior à data de início da tarefa pai.";
    }

    if (
      subtaskDueDate === taskStartDate &&
      taskStartTime !== null &&
      subtaskDueTime !== null &&
      subtaskDueTime < taskStartTime
    ) {
      return "O horário de entrega da subtarefa não pode ser anterior ao horário de início da tarefa pai.";
    }
  }

  return null;
};
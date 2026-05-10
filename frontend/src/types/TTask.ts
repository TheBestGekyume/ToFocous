export type TPriority = "low" | "medium" | "high";

export type TStatus = "unstarted" | "inProgress" | "concluded";

export type TTask = {
  id: string;
  title: string;
  description: string;
  due_date: string;
  due_time: string | null;
  start_date: string | null;
  start_time: string | null;
  priority: TPriority;
  status: TStatus;
  project_id: string;
  subtasks: TSubTask[];
};

export type TSubTask = {
  id: string;
  task_id: string;
  title: string;
  description: string;
  due_date: string;
  due_time: string | null;
  start_date: string | null;
  start_time: string | null;
  priority: TPriority;
  status: TStatus;
};

export type TCreateTaskDTO = {
  title: string;
  due_date: string;
  project_id: string;
  status: TStatus;

  description?: string;
  priority?: TPriority;
  start_date?: string | null;
  start_time?: string | null;
  due_time?: string | null;
};

export type TCreateSubTaskDTO = {
  title: string;
  due_date: string;
  status: TStatus;

  description?: string;
  priority?: TPriority;
  start_date?: string | null;
  start_time?: string | null;
  due_time?: string | null;
};

export type TUpdateTaskDTO = Partial<{
  title: string;
  description: string;
  priority: TPriority;
  status: TStatus;
  due_date: string;
  start_date: string | null;
  start_time: string | null;
  due_time: string | null;
}>;

export type TUpdateSubTaskDTO = Partial<{
  title: string;
  description: string;
  priority: TPriority;
  status: TStatus;
  due_date: string;
  start_date: string | null;
  start_time: string | null;
  due_time: string | null;
}>;
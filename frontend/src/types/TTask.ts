export type TPriority = "low" | "medium" | "high";

export type TStatus = | "unstarted" | "inProgress" | "concluded";

export type TTask = {
    id: string;
    title: string;
    description: string;
    due_date: string;
    due_time?: string | null;
    start_date?: string | null;
    start_time?: string | null;
    priority: TPriority;
    status: TStatus;
    subtasks: TSubTask[];
};

export type TSubTask = {
    id: string;
    task_id: string;
    title: string;
    description: string;
    due_date: string;
    due_time?: string | null;
    start_date?: string | null;
    start_time?: string | null;
    priority: TPriority;
    status: TStatus;
};

export type TCreateTaskDTO = {
    title: string;
    description: string | null;
    priority: TPriority;
    status: TStatus | null;
    due_date: string;
    start_date?: string | null;
    start_time?: string | null;
    due_time?: string | null;
};

export type TCreateSubtaskDTO = {
    title: string;
    description: string | null;
    status: TStatus;
    priority: TPriority;
    due_date: string;
    start_date?: string | null;
    start_time?: string | null;
    due_time?: string | null;
};
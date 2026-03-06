export type TPriority = "low" | "medium" | "high";

export type TStatus = | "unstarted" | "inProgress" | "concluded";

export type TTask = {
    id: string;
    // user_id: string;
    title: string;
    description: string;
    start_date: string;
    start_time: string;
    due_date: string;
    due_time: string;
    priority: TPriority;
    status: TStatus;
    subtasks: TSubTask[];
};

export type TSubTask = {
    id: string;
    task_id: string;
    title: string;
    description: string;
    start_date: string;
    start_time: string;
    due_date: string;
    due_time: string;
    priority: TPriority;
    status: TStatus;
};

export type TCreateTaskDTO = {
    title: string;
    description: string | null;
    due_date: string;
    priority: TPriority;
    status: TStatus | null;
    start_date: string | null;
    start_time: string | null;
    due_time: string | null;
};
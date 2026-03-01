export type TPriority = "low" | "medium" | "high";

export type TStatus = | "unstarted" | "inProgress" | "concluded";

export type TTask = {
    id: string;
    user_id: string;

    title: string;
    description: string;

    start_date: string | null;
    start_time: string | null;

    due_date: string;
    due_time: string | null;

    priority: TPriority;
    status: TStatus;

    subtasks: TSubTask[] | [];
};

export type TSubTask = {
    id: string;
    task_id: string;

    title: string;
    description: string;


    start_date: string | null;
    start_time: string | null;

    due_date: string | null;
    due_time: string | null;

    priority: TPriority | null;
    status: TStatus;
};
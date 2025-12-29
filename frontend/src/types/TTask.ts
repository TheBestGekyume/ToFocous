export type TTaskBase = {
    id: string;
    title: string;
    description: string;
    date: Date;
    priority: "low" | "medium" | "high";
    status: "not_started" | "in_progress" | "concluded";
};

export type TTask = TTaskBase & {
    subtasks: TSubTask[];
};

export type TSubTask = Omit<TTaskBase, "subtasks" | "priority">;
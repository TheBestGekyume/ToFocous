export type TTask = {
    id: string;
    title: string;
    date: Date;
    priority: "low" | "medium" | "high";
    status: "not_started" | "in_progress" | "concluded";
    // concluded: boolean;
};
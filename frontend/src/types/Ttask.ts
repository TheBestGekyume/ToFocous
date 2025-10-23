export type TTask = {
    title: string;
    date: Date;
    priority: "low" | "medium"| "high";
    status: "not started" | "execution on date" | "in progress" | "concluded";
    // concluded: boolean;
};
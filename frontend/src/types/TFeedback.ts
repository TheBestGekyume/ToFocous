import type { ReactNode } from "react";
import type { FeedbackType } from "../components/_Common/FeedbackToast";

export type AppFeedback = {
  type: FeedbackType;
  message: string | ReactNode;
};

export type SetAppFeedback = (feedback: AppFeedback | null) => void;
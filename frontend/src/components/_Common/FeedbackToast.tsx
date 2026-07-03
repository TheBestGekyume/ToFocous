import { CheckCircle, CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

export type FeedbackType = "success" | "error";

type FeedbackToastProps = {
  type: FeedbackType;
  message: string | ReactNode;
};

export const FeedbackToast = ({ type, message }: FeedbackToastProps) => {
  const isSuccess = type === "success";

  return (
    <div className="fixed right-4 top-4 z-1000 max-w-sm animate-[fadeIn_0.5s_ease-out]">
      <div
        className={`flex items-center gap-3 rounded-xl border p-4 shadow-xl backdrop-blur-md ${
          isSuccess
            ? "border-green-700/40 bg-green-950/90 text-green-200"
            : "border-red-700/40 bg-red-950/90 text-red-200"
        }`}
      >
        <div className="mt-0.5 shrink-0">
          {isSuccess ? <CheckCircle size={20} /> : <CircleAlert size={20} />}
        </div>

        <p className="flex-1 text-sm leading-5">{message}</p>
      </div>
    </div>
  );
};

import { useEffect, useState } from "react";
import { LoadingDots } from "./LoadingDots";

type LoadingOverlayProps = {
  show: boolean;
  delayedMessage?: string;
  delayMs?: number;
  showOnlyAfterDelay?: boolean;
};

export const LoadingOverlay = ({
  show,
  delayedMessage = "Aguarde um momento",
  delayMs = 5000,
  showOnlyAfterDelay = false,
}: LoadingOverlayProps) => {
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);

  useEffect(() => {
    if (!show) {
      setShowDelayedMessage(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowDelayedMessage(true);
    }, delayMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [show, delayMs]);

  if (!show || (showOnlyAfterDelay && !showDelayedMessage)) return null;
  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/20 backdrop-blur-xs">
      <div className="flex max-w-sm flex-col items-center gap-4 rounded-2xl border border-secondary/20 bg-background-header p-6 text-center shadow-lg">
        <span className="h-12 w-12 animate-spin rounded-full border-4 border-zinc-300 border-t-purple-500" />

        {showDelayedMessage && (
          <div className="flex flex-col gap-1">
            <span className="flex items-center justify-center gap-1.5 text-accent">
              <p className="text-text">{delayedMessage}</p>
              <LoadingDots />
            </span>
            <p className="text-sm text-text/70">
              Isso pode levar alguns segundos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

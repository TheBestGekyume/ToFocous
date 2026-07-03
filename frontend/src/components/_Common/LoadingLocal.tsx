import { LoadingDots } from "./LoadingDots";

type LoadingLocalProps = {
  message?: string;
  className?: string;
};

export const LoadingLocal = ({
  message = "Carregando",
  className = "",
}: LoadingLocalProps) => {
  return (
    <div
      className={`flex items-center justify-center rounded-xl ${className}`}
    >
      <div className="flex items-center gap-2 text-text">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-400 border-t-accent" />

        <span className="flex items-center gap-1">
          {message}
          <LoadingDots />
        </span>
      </div>
    </div>
  );
};
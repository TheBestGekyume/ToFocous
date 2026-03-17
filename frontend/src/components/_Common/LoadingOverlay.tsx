type LoadingOverlayProps = {
  show: boolean;
};

export const LoadingOverlay = ({ show }: LoadingOverlayProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="flex flex-col items-center gap-4">
        <span className="w-12 h-12 border-4 border-zinc-300 border-t-purple-500 rounded-full animate-spin" />
      </div>
    </div>
  );
};

export const LoadingDots = () => {
  return (

    <span className="inline-flex items-center gap-0.5">
      <span className="animate-bounce [animation-delay:-0.3s]">.</span>
      <span className="animate-bounce [animation-delay:-0.15s]">.</span>
      <span className="animate-bounce">.</span>
    </span>
  );
};
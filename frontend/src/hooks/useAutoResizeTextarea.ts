import { useEffect, useRef } from "react";

export const useAutoResizeTextarea = <T extends HTMLTextAreaElement>(
  value: string | null | undefined
) => {
  const ref = useRef<T | null>(null);

  const resize = () => {
    const element = ref.current;
    if (!element) return;

    element.style.height = "auto";
    element.style.height = `${element.scrollHeight}px`;
  };

  useEffect(() => {
    resize();
  }, [value]);

  return { ref, resize };
};
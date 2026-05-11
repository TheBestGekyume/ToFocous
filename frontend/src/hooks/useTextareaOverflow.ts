// src/hooks/useTextareaOverflow.ts

import { useCallback, useEffect, useRef, useState } from "react";

export const useTextareaOverflow = (value: string | null | undefined) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const frameRef = useRef<number | null>(null);

  const [hasOverflow, setHasOverflow] = useState(false);

  const checkOverflow = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    setHasOverflow(textarea.scrollHeight > textarea.clientHeight);
  }, []);

  const startResizeTracking = useCallback(() => {
    if (frameRef.current !== null) return;

    const track = () => {
      checkOverflow();
      frameRef.current = requestAnimationFrame(track);
    };

    frameRef.current = requestAnimationFrame(track);
  }, [checkOverflow]);

  const stopResizeTracking = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    checkOverflow();
  }, [checkOverflow]);

  useEffect(() => {
    requestAnimationFrame(checkOverflow);
  }, [value, checkOverflow]);

  useEffect(() => {
    const handleMouseUp = () => {
      stopResizeTracking();
    };

    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mouseup", handleMouseUp);
      stopResizeTracking();
    };
  }, [stopResizeTracking]);

  return {
    textareaRef,
    hasOverflow,
    checkOverflow,
    startResizeTracking,
    stopResizeTracking,
  };
};
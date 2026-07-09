import { useEffect, useRef, useState } from "react";
import type { AppFeedback } from "../types/TFeedback";

type UseEditableItemProps<T> = {
  initialData: T;
  onUpdate: (updated: T) => Promise<T | void>;
  onDelete?: () => Promise<void>;
  validate?: (data: T) => string | null;
  hasChanged?: (a: T, b: T) => boolean;
};

type StringField<T> = {
  [K in keyof T]: T[K] extends string | null | undefined ? K : never;
}[keyof T];

export function useEditableItem<T>({
  initialData,
  onUpdate,
  onDelete,
  validate,
  hasChanged,
}: UseEditableItemProps<T>) {
  const [localData, setLocalData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<AppFeedback | null>(null);
  const [resetSignal, setResetSignal] = useState(0);

  const lastSavedRef = useRef(initialData);
  const cancelEditRef = useRef(false);

  useEffect(() => {
    setLocalData(initialData);
    lastSavedRef.current = initialData;
  }, [initialData]);


  useEffect(() => {
    if (!feedback) return;

    const timeoutId = window.setTimeout(() => {
      setFeedback(null);
    }, 4000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [feedback]);

  const defaultHasChanged = (a: T, b: T) =>
    JSON.stringify(a) !== JSON.stringify(b);

  const checkChanged = hasChanged ?? defaultHasChanged;

  const commitUpdate = async (updated: T) => {
    const validationMessage = validate?.(updated) ?? null;

    if (validationMessage) {
      setLocalData(lastSavedRef.current);
      setResetSignal((current) => current + 1);
      setFeedback({
        type: "error",
        message: validationMessage,
      });
      return;
    }

    if (!checkChanged(updated, lastSavedRef.current)) return;

    try {
      setLoading(true);
      setFeedback(null);

      const res = await onUpdate(updated);
      lastSavedRef.current = res ?? updated;
    } finally {
      setLoading(false);
    }
  };

  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setLocalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImmediateChange = <K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    if (localData[field] === value) return;

    const updated = {
      ...localData,
      [field]: value,
    };

    setLocalData(updated);
    commitUpdate(updated);
  };

  const handleBlur = async () => {
    if (cancelEditRef.current) {
      cancelEditRef.current = false;
      return;
    }

    // if (validate && !validate(localData)) {
    //   setLocalData(lastSavedRef.current);
    //   return;
    // }

    await commitUpdate(localData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();

      if (!e.shiftKey) {
        (e.currentTarget as HTMLElement).blur();
      }

      return;
    }

    if (e.key === "Escape") {
      cancelEditRef.current = true;
      setLocalData(lastSavedRef.current);
      (e.currentTarget as HTMLElement).blur();
    }
  };

  const handleTextareaKeyDown =
    <K extends StringField<T>>(field: K) =>
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && e.shiftKey) {
          e.preventDefault();

          const textarea = e.currentTarget;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          const currentValue = String(localData[field] ?? "");

          const nextValue =
            currentValue.slice(0, start) + "\n" + currentValue.slice(end);

          handleChange(field, nextValue as T[K]);

          requestAnimationFrame(() => {
            textarea.selectionStart = start + 1;
            textarea.selectionEnd = start + 1;
          });

          return;
        }

        handleKeyDown(e);
      };


  const handleDelete = async () => {
    if (!onDelete) return;

    try {
      setLoading(true);
      await onDelete();
    } finally {
      setLoading(false);
    }
  };

  return {
    localData,
    setLocalData,
    loading,
    feedback,
    resetSignal,
    handleChange,
    handleImmediateChange,
    handleBlur,
    handleKeyDown,
    handleTextareaKeyDown,
    handleDelete,
  };
}
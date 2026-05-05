import { useEffect, useRef, useState } from "react";

type UseEditableItemProps<T> = {
  initialData: T;
  onUpdate: (updated: T) => Promise<T | void>;
  onDelete?: () => Promise<void>;
  validate?: (data: T) => boolean;
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

  const lastSavedRef = useRef(initialData);
  const cancelEditRef = useRef(false);

  useEffect(() => {
    setLocalData(initialData);
    lastSavedRef.current = initialData;
  }, [initialData]);

  const defaultHasChanged = (a: T, b: T) =>
    JSON.stringify(a) !== JSON.stringify(b);

  const checkChanged = hasChanged ?? defaultHasChanged;

  const commitUpdate = async (updated: T) => {
    if (!checkChanged(updated, lastSavedRef.current)) return;

    try {
      setLoading(true);
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

    if (validate && !validate(localData)) {
      setLocalData(lastSavedRef.current);
      return;
    }

    await commitUpdate(localData);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.currentTarget as HTMLElement).blur();
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
    handleChange,
    handleImmediateChange,
    handleBlur,
    handleKeyDown,
    handleTextareaKeyDown,
    handleDelete,
  };
}
import { useState } from "react";
import { Calendar } from "lucide-react";
import { useTaskForm } from "../../hooks/useTaskForm";
import type { TTask } from "../../types/TTask";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import { DatePicker } from "../_Common/DatePicker";

type TaskFormProps = {
  parentTask?: TTask;
  isCreatingSubTask?: boolean;
  onSuccess?: () => void;
};

const fieldClass = `
  rounded-md bg-zinc-700 p-2 h-10 outline-none duration-100
  border border-transparent text-white
  hover:bg-zinc-800 focus:bg-zinc-900 focus:border-accent
`;

const datePickerClass = `
  [&_button]:w-full
  [&_button]:h-10
  [&_button]:rounded-md
  [&_button]:outline-none
  [&_button]:bg-zinc-700
  [&_button]:border
  [&_button]:border-transparent
  [&_button]:px-3
  [&_button]:py-2
  [&_button]:text-base
  [&_button]:text-white
  [&_button]:justify-start
  [&_button]:gap-3
  [&_button]:hover:bg-zinc-800
  [&_button]:focus:bg-zinc-900
  [&_button]:focus:border-accent
  [&_span]:text-nowrap
  [&_span]:text-white
`;

export const TaskForm = ({
  parentTask,
  isCreatingSubTask = false,
  onSuccess,
}: TaskFormProps) => {
  const { formData, handleChange, handleSubmit } = useTaskForm({
    parentTask,
    isCreating: true,
    isCreatingSubTask,
    onClose: onSuccess,
  });

  const [loading, setLoading] = useState(false);

  const handleDateChange = (date: string | null) => {
    const event = {
      target: {
        name: "due_date",
        value: date ?? "",
      },
    } as React.ChangeEvent<HTMLInputElement>;

    handleChange(event);
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);

    try {
      await handleSubmit(event);
    } finally {
      setLoading(false);
    }
  };

  
  return (
    <>
      <LoadingOverlay show={loading} />

      <form onSubmit={submitForm} className="flex flex-wrap items-start gap-4">
        <fieldset className="flex flex-col flex-1 min-w-[250px]">
          <label htmlFor="title" className="font-semibold mb-1">
            Título
          </label>

          <input
            id="title"
            name="title"
            type="text"
            placeholder={
              isCreatingSubTask
                ? "Título da nova subtarefa..."
                : "Título da nova tarefa..."
            }
            value={formData.title}
            onChange={handleChange}
            autoComplete="off"
            className={fieldClass}
            required
          />
        </fieldset>

        {!isCreatingSubTask && (
          <fieldset className="flex flex-col flex-1 min-w-[250px]">
            <label htmlFor="priority" className="font-semibold mb-1">
              Prioridade
            </label>

            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className={`cursor-pointer ${fieldClass}`}
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </fieldset>
        )}

        <fieldset className="flex flex-col">
          <label className="font-semibold mb-1">Data</label>

          <div className={`relative ${datePickerClass}`}>
            <DatePicker
              value={formData.due_date}
              onChange={handleDateChange}
              title="Selecionar data"
              placeholder="dd / mm / aaaa"
              icon={Calendar}
              required
            />

            <input
              type="text"
              value={formData.due_date ?? ""}
              onChange={() => undefined}
              required
              tabIndex={-1}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 h-10 w-full opacity-0"
            />
          </div>
        </fieldset>

        <fieldset className="flex flex-col basis-full min-w-40">
          <label htmlFor="description" className="font-semibold mb-1">
            Descrição
          </label>

          <textarea
            id="description"
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="
              rounded-md bg-zinc-700 border border-transparent p-2 min-h-[60px]
              duration-100 outline-none hover:bg-zinc-800 focus:bg-zinc-900 focus:border-accent
            "
          />
        </fieldset>

        <div className="w-full flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 h-10 rounded-md bg-green-600 hover:bg-green-800 disabled:opacity-70 disabled:cursor-not-allowed font-semibold transition"
          >
            + Adicionar
          </button>
        </div>
      </form>
    </>
  );
};

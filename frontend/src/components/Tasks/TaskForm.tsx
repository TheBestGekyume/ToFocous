import { useState } from "react";
import { useTaskForm } from "../../hooks/useTaskForm";
import type { TTask, TSubTask } from "../../types/TTask";
import { LoadingOverlay } from "../_Common/LoadingOverlay";

import { Calendar } from "lucide-react";
import { DatePicker } from "../_Common/DatePicker";

type TaskFormProps = {
  taskToEdit?: TTask | TSubTask;
  parentTask?: TTask;
  isCreating: boolean;
  isCreatingSubTask?: boolean;
  onClose?: () => void;
};

const datePickerInputClass = `
  [&_button]:w-full
  [&_button]:h-10
  [&_button]:rounded-md
  [&_button]:bg-zinc-700
  [&_button]:border-0
  [&_button]:px-3
  [&_button]:py-2
  [&_button]:text-base
  [&_button]:text-white
  [&_button]:justify-start
  [&_button]:gap-3
  [&_button]:hover:bg-zinc-700
  [&_button]:focus:bg-zinc-700
  [&_button]:focus:outline-none
  [&_span]:text-nowrap
  [&_span]:text-white
`;
export const TaskForm = ({
  isCreating,
  isCreatingSubTask,
  taskToEdit,
  parentTask,
  onClose,
}: TaskFormProps) => {
  const { formData, handleChange, handleSubmit } = useTaskForm({
    initialTask: taskToEdit,
    parentTask,
    isCreating,
    isCreatingSubTask,
    onClose,
  });

  const [loading, setLoading] = useState(false);

  const handleDateChange = (date: string | null) => {
    handleChange({
      target: {
        name: "due_date",
        value: date ?? "",
      },
    } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <>
      <LoadingOverlay show={loading} />
      <form
        onSubmit={async (e) => {
          setLoading(true);
          try {
            await handleSubmit(e);
          } finally {
            setLoading(false);
          }
        }}
        className={`flex flex-wrap ${
          isCreating ? "items-start" : "items-end"
        } gap-4`}
      >
        <fieldset className="flex flex-col flex-1 min-w-[250px]">
          <label htmlFor="title" className="font-semibold mb-1">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Adicionar nova tarefa..."
            value={formData.title}
            onChange={handleChange}
            autoComplete="off"
            className="rounded-md bg-zinc-700 p-2 h-10"
            required
          />
        </fieldset>

        {!isCreatingSubTask && (
          <fieldset className="flex flex-col flex-1 min-w-[250px]">
            <label className="font-semibold mb-1">Prioridade</label>
            <select
              name="priority"
              value={(formData as TTask).priority}
              onChange={handleChange}
              className="rounded-md bg-zinc-700 p-2 h-10"
            >
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </fieldset>
        )}

        <fieldset className="flex flex-col">
          <label className="font-semibold mb-1">Data</label>

          <div className={datePickerInputClass}>
            <DatePicker
              value={formData.due_date}
              onChange={handleDateChange}
              title="Selecionar data"
              placeholder="dd / mm / aaaa"
              icon={Calendar}
            />
          </div>
        </fieldset>

        {!isCreating && !isCreatingSubTask && (
          <fieldset className="flex flex-col flex-1 min-w-40">
            <label className="font-semibold mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="rounded-md bg-zinc-700 p-2 h-10"
            >
              <option value="unstarted">Não iniciada</option>
              <option value="inProgress">Em andamento</option>
              <option value="concluded">Concluída</option>
            </select>
          </fieldset>
        )}

        <fieldset className="flex flex-col basis-full min-w-40">
          <label className="font-semibold mb-1">Descrição</label>
          <textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            className="rounded-md bg-zinc-700 p-2 min-h-[60px]"
          />
        </fieldset>
        <div className=" w-full flex justify-between">
          <button
            type="submit"
            className={`px-6 py-2 h-10 rounded-md bg-green-700 hover:bg-green-800 font-semibold ${
              isCreating ? "mx-auto" : ""
            }`}
          >
            {isCreating ? "+ Adicionar" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </>
  );
};

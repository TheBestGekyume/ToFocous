import { useTaskForm } from "../../hooks/useTaskForm";
import type { TTask, TSubTask } from "../../types/TTask";

type TaskFormProps = {
  taskToEdit?: TTask | TSubTask;
  parentTask?: TTask;
  isCreating: boolean;
  isCreatingSubtask?: boolean;
  setTasks: React.Dispatch<React.SetStateAction<TTask[]>>;
  setSelectedTask?: React.Dispatch<React.SetStateAction<TTask | null>>;
  onClose?: () => void;
};

export const TaskForm = ({
  setTasks,
  isCreating,
  isCreatingSubtask,
  taskToEdit,
  parentTask,
  setSelectedTask,
  onClose,
}: TaskFormProps) => {
  const { formData, handleChange, handleSubmit, deleteTask } = useTaskForm({
    initialTask: taskToEdit,
    parentTask,
    isCreating,
    isCreatingSubtask,
    setTasks,
    setSelectedTask,
    onClose,
  });

  return (
    <form
      onSubmit={handleSubmit}
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

      {!isCreatingSubtask && (
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

      <fieldset className="flex flex-col min-w-40">
        <label className="font-semibold mb-1">Data</label>
        <input
          name="date"
          type="date"
          value={new Date(formData.date).toISOString().split("T")[0]}
          onChange={handleChange}
          className="rounded-md bg-zinc-700 p-2 h-10"
        />
      </fieldset>

      {!isCreating && !isCreatingSubtask && (
        <fieldset className="flex flex-col flex-1 min-w-40">
          <label className="font-semibold mb-1">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="rounded-md bg-zinc-700 p-2 h-10"
          >
            <option value="not_started">Não iniciada</option>
            <option value="in_progress">Em andamento</option>
            <option value="concluded">Concluída</option>
          </select>
        </fieldset>
      )}

      <fieldset className="flex flex-col basis-full min-w-40">
        <label className="font-semibold mb-1">Descrição</label>
        <textarea
          name="description"
          value={formData.description}
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

        {!isCreating && !isCreatingSubtask && (
          <button
            type="button"
            onClick={deleteTask}
            className="px-6 py-2 h-10 rounded-md bg-red-600 hover:bg-red-700 font-semibold"
          >
            Deletar
          </button>
        )}
      </div>
    </form>
  );
};

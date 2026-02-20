import { TaskForm } from "./TaskForm";
import { Task } from "./Task";
import { SortTasks } from "./SortTasks";
import { useTasks } from "../../contexts/TasksContext";
import { TaskDetails } from "./TaskDetails";

export const Tasks = () => {
  const { tasks, setTasks, selectedTask } = useTasks();

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => task.status !== "concluded"));
  };
  console.log("Tasks.tsx renderizado");
  return (
    <section id="tasks" className="p-5 sm:p-8 md:p-10 md:pt-0">
      <div className="flex flex-col bg-background-header/40 mx-auto w-full max-w-4xl border border-zinc-500 rounded-xl p-5 gap-8">
        {/* Se uma task está selecionada, mostra apenas ela */}
        {selectedTask ? (
          <TaskDetails />
        ) : (
          <>
            <TaskForm setTasks={setTasks} isCreating={true} />

            <hr className="text-zinc-700" />

            <div className="flex flex-wrap items-center justify-between gap-4">
              <SortTasks />
              <button
                onClick={clearCompleted}
                className="p-2 cursor-pointer rounded-md text-red-200 bg-red-600 hover:bg-red-900 font-semibold transition-colors"
              >
                Limpar Concluídas
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <Task key={task.id} task={task} setTasks={setTasks} />
                ))
              ) : (
                <p className="text-zinc-500 text-center italic">
                  Nenhuma tarefa adicionada ainda.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

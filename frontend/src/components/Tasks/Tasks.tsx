import { useEffect } from "react";
import { useParams } from "react-router-dom";

import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";
import { SortTasks } from "./SortTasks";
import { useTasks } from "../../hooks/useTasks";

export const Tasks = () => {
  const { tasks, setTasks, getTasksByProject } = useTasks();
  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      getTasksByProject(projectId);
    }
  }, [getTasksByProject, projectId]);

  const clearCompleted = () => {
    setTasks((prev) =>
      prev.filter((task) => task.status !== "concluded")
    );
  };

  return (
    <section id="tasks" className="p-5 sm:p-8 md:p-10 md:pt-0">
      <div className="flex flex-col bg-background-header/40 mx-auto w-full max-w-5xl border border-zinc-500 rounded-xl p-5 gap-8">
        <>
          <TaskForm isCreating={true} />

          <hr className="text-zinc-700" />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <SortTasks />
            <button
              onClick={clearCompleted}
              className="p-2 rounded-md text-red-200 bg-red-600 hover:bg-red-900 font-semibold transition-colors"
            >
              Limpar Concluídas
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))
            ) : (
              <p className="text-zinc-500 text-center italic">
                Nenhuma tarefa adicionada ainda.
              </p>
            )}
          </div>
        </>
      </div>
    </section>
  );
};
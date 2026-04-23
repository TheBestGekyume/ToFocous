import { useEffect } from "react";
import { useParams } from "react-router-dom";
// import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";
// import { SortTasks } from "./SortTasks";
import { useTasks } from "../../hooks/useTasks";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
// import { useProjects } from "../../hooks/useProjects";

export const TaskList = () => {
  const { tasks, setTasks, getTasksByProject, loading } = useTasks();
  // const {} = useProjects();
  const { projectId } = useParams();

  useEffect(() => {
    if (projectId) {
      setTasks([]);
      getTasksByProject(projectId);
    }
  }, [getTasksByProject, projectId, setTasks]);

  // const clearCompleted = () => {
  //   setTasks((prev) => prev.filter((task) => task.status !== "concluded"));
  // };

  return (
    <>
      <LoadingOverlay show={loading} />
      <section id="tasks" className="">
          
            <div className="flex flex-col gap-3">
              {tasks.length > 0 ? (
                tasks.map((task) => <TaskItem key={task.id} task={task} />)
              ) : (
                <p className="text-zinc-500 text-center italic py-5">
                  Nenhuma tarefa adicionada ainda.
                </p>
              )}
            </div>
      </section>
    </>
  );
};

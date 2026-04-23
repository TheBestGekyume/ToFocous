import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { SortTasks } from "../components/Tasks/SortTasks";
import { TaskForm } from "../components/Tasks/TaskForm";
import { TaskList } from "../components/Tasks/TaskList";

import { useTasks } from "../hooks/useTasks";
import { useProjects } from "../hooks/useProjects";

import type { TProject } from "../types/TProject";
import { ProjectItem } from "../components/Projects/ProjectItem";

export const TaskPage = () => {
  const { setTasks } = useTasks();
  const { getProjectById } = useProjects();

  const { projectId } = useParams();

  const [currentProject, setCurrentProject] = useState<TProject | null>(null);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;

      try {
        const project = await getProjectById(projectId);

        setCurrentProject(project);
      } catch (error) {
        console.error("Erro ao carregar projeto:", error);
      }
    };

    loadProject();
  }, [projectId, getProjectById]);

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => task.status !== "concluded"));
  };

  return (
    <div className="flex flex-col w-full max-w-5xl mx-auto">
      {currentProject && (
        <div className="py-10">
          <ProjectItem project={currentProject}   showActions={false} />
          
        </div>
      )}
      <div className="flex flex-col bg-background-header/40 border border-zinc-500 rounded-xl p-5 gap-8">
        <div className="w-full transition-all duration-300">
          <TaskForm isCreating={true} />

          <hr className="text-zinc-700 my-10" />

          <div className="px-4">
            <div className="flex flex-wrap justify-between items-center pb-4">
              <div className="flex flex-wrap gap-4">
                <SortTasks />

                <button
                  onClick={clearCompleted}
                  className="p-2 rounded-md text-red-200 bg-red-600 hover:bg-red-900 font-semibold transition-colors"
                >
                  Limpar Concluídas
                </button>
              </div>
              <h4 className="text-xl text-accent pe-2">
                <span className="text-white">/</span> {currentProject?.title}
              </h4>{" "}
            </div>

            <TaskList />
          </div>
        </div>
      </div>
    </div>
  );
};

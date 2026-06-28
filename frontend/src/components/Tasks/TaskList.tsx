import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TaskItem } from "./TaskItem";
import { useTasks } from "../../hooks/useTasks";
import type { TProjectMember } from "../_Common/AssignmentControl";
import { LoadingLocal } from "../_Common/LoadingLocal";

type TaskListProps = {
  projectMembers: TProjectMember[];
  isProjectOwner: boolean;
};

export const TaskList = ({ projectMembers, isProjectOwner }: TaskListProps) => {
  const { tasks, setTasks, getTasksByProject, getProjectAssignments } =
    useTasks();

  const { projectId } = useParams();

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadTaskList = async () => {
      if (!projectId) return;

      setInitialLoading(true);
      setTasks([]);

      try {
        await Promise.all([
          getTasksByProject(projectId),
          getProjectAssignments(projectId),
        ]);
      } finally {
        if (!ignore) {
          setInitialLoading(false);
        }
      }
    };

    loadTaskList();

    return () => {
      ignore = true;
    };
  }, [getProjectAssignments, getTasksByProject, projectId, setTasks]);

  return (
    <section id="tasks">
      <div className="flex flex-col gap-3">
        {initialLoading ? (
          <LoadingLocal message="Carregando tarefas" />
        ) : tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              projectMembers={projectMembers}
              isProjectOwner={isProjectOwner}
            />
          ))
        ) : (
          <p className="text-zinc-500 text-center italic py-5">
            Nenhuma tarefa adicionada ainda.
          </p>
        )}
      </div>
    </section>
  );
};
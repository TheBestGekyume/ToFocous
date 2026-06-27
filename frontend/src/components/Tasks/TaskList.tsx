import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { TaskItem } from "./TaskItem";
import { useTasks } from "../../hooks/useTasks";
import { LoadingOverlay } from "../_Common/LoadingOverlay";
import type { TProjectMember } from "../_Common/AssignmentControl";

type TaskListProps = {
  projectMembers: TProjectMember[];
  isProjectOwner: boolean;
};

export const TaskList = ({
  projectMembers,
  isProjectOwner,
}: TaskListProps) => {
  const {
    tasks,
    setTasks,
    getTasksByProject,
    getProjectAssignments,
    loading,
  } = useTasks();

  const { projectId } = useParams();

  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const loadTasks = async () => {
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

    loadTasks();

    return () => {
      ignore = true;
    };
  }, [getProjectAssignments, getTasksByProject, projectId, setTasks]);

  return (
    <>
      <LoadingOverlay show={loading || initialLoading} />

      <section id="tasks">
        <div className="flex flex-col gap-3">
          {!initialLoading && tasks.length > 0 ? (
            tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                projectMembers={projectMembers}
                isProjectOwner={isProjectOwner}
              />
            ))
          ) : !initialLoading ? (
            <p className="text-zinc-500 text-center italic py-5">
              Nenhuma tarefa adicionada ainda.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
};
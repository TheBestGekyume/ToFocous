import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { TaskItem } from "../Tasks/TaskItem";
import type { TTask } from "../../types/TTask";
import type { TProjectMember } from "../_Common/AssignmentControl";

type TaskHeaderProps = {
  task: TTask;
  projectMembers?: TProjectMember[];
  isProjectOwner?: boolean;
};

export const TaskHeader = ({
  task,
  projectMembers = [],
  isProjectOwner = false,
}: TaskHeaderProps) => {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  const handleGoBack = () => {
    navigate(`/projects/${projectId}`);
  };

  return (
    <div
      className="
        mt-6 grid w-full min-w-0 grid-cols-1
        items-start gap-3 mt-15
        md:mt-0 md:grid-cols-[auto_minmax(0,1fr)]
      "
    >
      <button
        type="button"
        onClick={handleGoBack}
        className="
          flex h-10 w-fit items-center justify-center gap-2
          rounded-md bg-zinc-700/75 px-3 py-2
          text-sm font-medium duration-300
          hover:bg-zinc-800/75 ms-auto

          md:w-10 md:shrink-0 md:rounded-full
          md:p-2 md:ms-0
        "
        aria-label="Voltar para o projeto"
        title="Voltar para o projeto"
      >
        <ArrowLeft size={20} />

        <span className="md:hidden">
          Voltar
        </span>
      </button>

      <section className="w-full min-w-0 md:pe-2">
        <TaskItem
          task={task}
          projectMembers={projectMembers}
          isProjectOwner={isProjectOwner}
        />
      </section>
    </div>
  );
};
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TaskItem } from "../Tasks/TaskItem";
import type { TTask } from "../../types/TTask";
import { useParams } from "react-router-dom";
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

  const { projectId } = useParams();

  return (
    <div className="flex flex-col md:flex-row">
      <button
        className="p-2 bg-zinc-700/75 hover:bg-zinc-800/75 duration-300 w-fit rounded-full h-fit"
        onClick={() => navigate(`/projects/${projectId}`)}
      >
        <ArrowLeft size={24} />
      </button>

      <section className="mx-auto w-full px-15">
        <TaskItem
          task={task}
          projectMembers={projectMembers}
          isProjectOwner={isProjectOwner}
        />
      </section>
    </div>
  );
};

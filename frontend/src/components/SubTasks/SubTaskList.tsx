import type { TTask } from "../../types/TTask";
import type { TProjectMember } from "../_Common/AssignmentControl";
import { SubTaskItem } from "./SubTaskItem";

type Props = {
  task: TTask;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  projectMembers?: TProjectMember[];
  isProjectOwner?: boolean;
};

export const SubTaskList = ({
  task,
  setLoading,
  projectMembers = [],
  isProjectOwner = false,
}: Props) => {
  if (!task.subtasks || task.subtasks.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      {task.subtasks.map((subtask) => (
        <SubTaskItem
          key={subtask.id}
          subtask={subtask}
          taskId={task.id}
          setLoading={setLoading}
          projectMembers={projectMembers}
          isProjectOwner={isProjectOwner}
        />
      ))}
    </section>
  );
};

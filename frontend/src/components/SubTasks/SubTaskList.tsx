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
  if (!task.subtasks || task.subtasks.length === 0) {
    return (
      <p className="py-5 text-center italic text-zinc-500">
        Nenhuma SubTarefa adicionada ainda.
        <br />
        Clique em{" "}
        <span className="font-medium text-green-300/70">+ SubTarefa</span> para
        adicionar!
      </p>
    );
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-3">
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

import type { TTask } from "../../types/TTask";
import { SubtaskItem } from "./SubTaskItem";

type SubtaskListProps = {
  task: TTask;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubtaskList = ({ task, setLoading }: SubtaskListProps) => {
  if (!task.subtasks || task.subtasks.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      {task.subtasks.map((subtask) => (
        <SubtaskItem
          key={subtask.id}
          subtask={subtask}
          taskId={task.id}
          setLoading={setLoading}
        />
      ))}
    </section>
  );
};

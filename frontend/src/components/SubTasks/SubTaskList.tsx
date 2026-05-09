import type { TTask } from "../../types/TTask";
import { SubTaskItem } from "./SubTaskItem";

type SubTaskListProps = {
  task: TTask;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const SubTaskList = ({ task, setLoading }: SubTaskListProps) => {
  if (!task.subtasks || task.subtasks.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      {task.subtasks.map((subtask) => (
        <SubTaskItem
          key={subtask.id}
          subtask={subtask}
          taskId={task.id}
          setLoading={setLoading}
        />
      ))}
    </section>
  );
};

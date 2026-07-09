import { useMemo } from "react";
import type { TTask, TSubTask } from "../../types/TTask";
import type { TProjectMember } from "../_Common/AssignmentControl";
import { SubTaskItem } from "./SubTaskItem";
import { useTasks } from "../../hooks/useTasks";

type Props = {
  task: TTask;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  projectMembers?: TProjectMember[];
  isProjectOwner?: boolean;
};

const getPriorityOrder = (priority: TSubTask["priority"]) => {
  switch (priority) {
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
};

const getStatusOrder = (status: TSubTask["status"]) => {
  switch (status) {
    case "unstarted":
      return 1;
    case "inProgress":
      return 2;
    case "concluded":
      return 3;
    default:
      return 4;
  }
};

const getDateTimeValue = (subtask: TSubTask) => {
  if (!subtask.due_date) {
    return Number.MAX_SAFE_INTEGER;
  }

  const time = subtask.due_time || "23:59";
  const dateTime = new Date(`${subtask.due_date}T${time}`).getTime();

  return Number.isNaN(dateTime) ? Number.MAX_SAFE_INTEGER : dateTime;
};

export const SubTaskList = ({
  task,
  setLoading,
  projectMembers = [],
  isProjectOwner = false,
}: Props) => {
  const { sortConfig } = useTasks();

  const sortedSubTasks = useMemo(() => {
    const subtasks = [...(task.subtasks ?? [])];

    return subtasks.sort((a, b) => {
      const direction = sortConfig.isAscending ? 1 : -1;

      if (sortConfig.type === "date") {
        const aHasDate = !!a.due_date;
        const bHasDate = !!b.due_date;

        if (!aHasDate && !bHasDate) {
          return a.title.localeCompare(b.title, "pt-BR");
        }

        if (!aHasDate) return 1;
        if (!bHasDate) return -1;

        return (getDateTimeValue(a) - getDateTimeValue(b)) * direction;
      }

      if (sortConfig.type === "priority") {
        const priorityComparison =
          getPriorityOrder(a.priority) - getPriorityOrder(b.priority);

        if (priorityComparison !== 0) {
          return priorityComparison * direction;
        }
      }

      if (sortConfig.type === "status") {
        const statusComparison =
          getStatusOrder(a.status) - getStatusOrder(b.status);

        if (statusComparison !== 0) {
          return statusComparison * direction;
        }
      }

      return a.title.localeCompare(b.title, "pt-BR");
    });
  }, [task.subtasks, sortConfig.type, sortConfig.isAscending]);

  if (sortedSubTasks.length === 0) {
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
      {sortedSubTasks.map((subtask) => (
        <SubTaskItem
          key={subtask.id}
          subtask={subtask}
          parentTask={task}
          taskId={task.id}
          setLoading={setLoading}
          projectMembers={projectMembers}
          isProjectOwner={isProjectOwner}
        />
      ))}
    </section>
  );
};
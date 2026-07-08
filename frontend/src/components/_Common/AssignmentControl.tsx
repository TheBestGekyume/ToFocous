import { useState } from "react";
import { X } from "lucide-react";
import { Dropdown } from "./Dropdown";
import { LoadingLocal } from "./LoadingLocal";
import type { TTaskAssignment } from "../../types/TTaskAssignment";

export type TProjectMember = {
  id: string;
  name: string;
};

type AssignmentControlProps = {
  assignments: TTaskAssignment[];
  members: TProjectMember[];
  canManage: boolean;
  onAssign: (userId: string) => Promise<void>;
  onRemove: (assignmentId: string) => Promise<void>;
};

type AssignmentOption = {
  value: string;
  label: string;
};

export const AssignmentControl = ({
  assignments,
  members,
  canManage,
  onAssign,
  onRemove,
}: AssignmentControlProps) => {
  const [loading, setLoading] = useState(false);

  const assignedUserIds = new Set(
    assignments.map((assignment) => assignment.assigned_user_id)
  );

  const assignmentOptions: AssignmentOption[] = members
    .filter((member) => !assignedUserIds.has(member.id))
    .map((member) => ({
      value: member.id,
      label: member.name,
    }));

  const handleAssign = async (userId: string) => {
    if (!userId || loading) return;

    setLoading(true);

    try {
      await onAssign(userId);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (assignmentId: string) => {
    if (loading) return;

    setLoading(true);

    try {
      await onRemove(assignmentId);
    } finally {
      setLoading(false);
    }
  };

  if (!canManage && assignments.length === 0) {
    return null;
  }

  return (
    <div
      className="
        flex w-full min-w-0 flex-col items-stretch gap-2
        sm:flex-row sm:flex-wrap sm:items-center
      "
    >
      <span className="shrink-0 text-xs font-semibold text-primary">
        Responsáveis
      </span>

      {loading ? (
        <LoadingLocal
          message="Atualizando responsáveis"
          className="w-fit max-w-full p-0 text-xs"
        />
      ) : (
        <>
          {assignments.length > 0 && (
            <div
              className="
                flex min-w-0 flex-wrap items-center gap-2
                sm:flex-1
              "
            >
              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="
                    flex min-w-0 max-w-full items-center gap-1
                    rounded-full bg-zinc-900 px-2 py-1
                    text-xs text-zinc-200
                  "
                >
                  <span
                    className="
                      min-w-0 max-w-[12rem] truncate
                      sm:max-w-[16rem]
                    "
                    title={assignment.assigned_user.name}
                  >
                    {assignment.assigned_user.name}
                  </span>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => void handleRemove(assignment.id)}
                      className="
                        shrink-0 rounded-full p-0.5 duration-100
                        hover:bg-red-500/75
                        focus-visible:outline-2
                        focus-visible:outline-offset-1
                        focus-visible:outline-red-400
                      "
                      title={`Remover ${assignment.assigned_user.name}`}
                      aria-label={`Remover responsável ${assignment.assigned_user.name}`}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {canManage && assignmentOptions.length > 0 && (
            <div
              className="
                relative z-10 w-full min-w-0
                sm:ml-auto sm:w-auto sm:shrink-0
              "
            >
              <Dropdown<string>
                value=""
                options={assignmentOptions}
                onChange={(userId) => void handleAssign(userId)}
                renderLabel={() => "Adicionar responsável"}
                buttonClass="
                  w-full max-w-full whitespace-normal break-words
                  rounded-md bg-zinc-900 px-3 py-2
                  text-left text-xs text-text duration-150
                  hover:bg-secondary/50 focus:bg-accent
                  sm:w-auto sm:whitespace-nowrap
                "
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
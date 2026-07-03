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

  const assignedUserIds = assignments.map(
    (assignment) => assignment.assigned_user_id
  );

  const availableMembers = members.filter(
    (member) => !assignedUserIds.includes(member.id)
  );

  const assignmentOptions: AssignmentOption[] = availableMembers.map(
    (member) => ({
      value: member.id,
      label: member.name,
    })
  );

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
  <div className="flex w-full min-w-0 items-center gap-2 whitespace-nowrap">
    <span className="shrink-0 text-xs font-semibold text-primary">
      Responsáveis
    </span>

    {loading && (
      <LoadingLocal
        message="Atualizando responsáveis"
        className="w-fit shrink-0 p-0 text-xs"
      />
    )}

    {!loading && (
      <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="flex shrink-0 items-center gap-1 rounded-full border border-zinc-600 bg-zinc-900 px-2 py-1 text-xs text-zinc-200"
          >
            <span>{assignment.assigned_user.name}</span>

            {canManage && (
              <button
                type="button"
                onClick={() => void handleRemove(assignment.id)}
                className="rounded-full p-0.5 hover:bg-zinc-700"
                title="Remover responsável"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    )}

    {!loading && canManage && assignmentOptions.length > 0 && (
      <div className="relative z-10 shrink-0">
        <Dropdown<string>
          value=""
          options={assignmentOptions}
          onChange={(userId) => void handleAssign(userId)}
          renderLabel={() => "Adicionar responsável"}
          buttonClass="rounded-md bg-zinc-900 px-2 py-2 text-xs text-text hover:bg-secondary/50 focus:bg-accent duration-150"
        />
      </div>
    )}
  </div>
);
};
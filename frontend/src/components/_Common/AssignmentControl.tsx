import { X } from "lucide-react";
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

export const AssignmentControl = ({
  assignments,
  members,
  canManage,
  onAssign,
  onRemove,
}: AssignmentControlProps) => {
  const assignedUserIds = assignments.map(
    (assignment) => assignment.assigned_user_id
  );

  const availableMembers = members.filter(
    (member) => !assignedUserIds.includes(member.id)
  );

  if (!canManage && assignments.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {assignments.map((assignment) => (
        <div
          key={assignment.id}
          className="flex items-center gap-1 rounded-full bg-zinc-900 border border-zinc-600 px-2 py-1 text-xs text-zinc-200"
        >
          <span>{assignment.assigned_user.name}</span>

          {canManage && (
            <button
              type="button"
              onClick={() => onRemove(assignment.id)}
              className="rounded-full hover:bg-zinc-700 p-0.5"
              title="Remover responsável"
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}

      {canManage && availableMembers.length > 0 && (
        <select
          value=""
          onChange={(event) => {
            const userId = event.target.value;
            if (!userId) return;

            onAssign(userId);
          }}
          className="rounded-md bg-zinc-900 border border-zinc-600 px-2 py-1 text-xs text-text outline-none focus:border-accent"
        >
          <option value="">Adicionar responsável</option>

          {availableMembers.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};
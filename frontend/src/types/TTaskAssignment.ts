export type TAssignedUser = {
  id: string;
  name: string;
};

export type TTaskAssignment = {
  id: string;
  project_id: string;
  assigned_user_id: string;
  assigned_by_user_id: string;
  task_id: string | null;
  subtask_id: string | null;
  created_at: string;
  assigned_user: TAssignedUser;
  assigned_by_user?: TAssignedUser;
};

export type TCreateTaskAssignmentDTO =
  | {
      task_id: string;
      subtask_id?: null;
      assigned_user_id: string;
    }
  | {
      task_id?: null;
      subtask_id: string;
      assigned_user_id: string;
    };

export type TDeleteTaskAssignmentDTO = {
  assignment_id: string;
};
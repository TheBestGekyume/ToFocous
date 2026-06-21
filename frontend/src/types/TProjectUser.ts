export type TProjectUserUser = {
  id: string;
  name: string;
};

export type TProjectUser = {
  id: string;
  project_id: string;
  user_id: string;
  user: TProjectUserUser | null;
};

export type TAddProjectUserDTO = {
  project_id: string;
  user_id: string;
};

export type TRemoveProjectUserDTO = {
  project_id: string;
  user_id: string;
};
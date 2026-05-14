export type TProjectUser = {
  id: string;
  project_id: string;
  user_id: string;
  usuarios: {
    id: string;
    name: string;
  } | null;
};

export type TAddProjectUserDTO = {
  project_id: string;
  user_id: string;
};

export type TRemoveProjectUserDTO = {
  project_id: string;
  user_id: string;
};
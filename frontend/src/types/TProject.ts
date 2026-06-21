export type TProject = {
  id: string;
  title: string;
  description: string;
  color: string;
  is_owner: boolean;
};

export type TCreateProjectDTO = {
  title: string;
  description: string;
  color: string;
};

export type TUpdateProjectDTO = Partial<TCreateProjectDTO>;
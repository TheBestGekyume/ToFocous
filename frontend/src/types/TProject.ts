export type TProject = {
  id: string;
  title: string;
  description: string;
  color: string;
};

export type TCreateProjectDTO = {
  title: string;
  description: string;
  color: string;
};

export type TUpdateProjectDTO = Partial<TCreateProjectDTO>;
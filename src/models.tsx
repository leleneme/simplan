export type Task = {
  id?: number;
  title: string;
  done: boolean;
  projectId: number;
};

export type Project = {
  id?: number;
  name: string;
};
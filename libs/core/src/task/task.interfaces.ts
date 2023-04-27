export type TTaskFunction = (taskId: string, payload: any) => Promise<any | undefined>;

export interface ITask<K extends TTaskFunction> {
  run: K;
}

export interface ITaskOptions {
  queue?: boolean;
}

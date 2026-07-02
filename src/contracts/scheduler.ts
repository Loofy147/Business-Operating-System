import { Task } from '../types';

export interface IScheduler {
  schedule(task: Task): void;
  getNextTask(): Task | undefined;
  cancelTask(taskId: string): void;
}

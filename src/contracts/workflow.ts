import { Task } from '../types';

export interface IWorkflow {
  id: string;
  tasks: Task[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  addTask(task: Task): void;
  getExecutableTasks(): Task[];
}

import { Task } from '../types';

export interface IPolicyEngine {
  validateTask(task: Task): { allowed: boolean; reason?: string };
}

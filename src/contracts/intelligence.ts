import { ModelConfig, Task } from '../types';

export interface IModelRouter {
  selectModel(task: Task, context: any): ModelConfig;
}

export interface IReasoner {
  reason(input: any): Promise<string>;
}

export interface IPlanner {
  createPlan(task: Task): Promise<Task[]>;
}

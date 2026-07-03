import { ModelConfig, Task, ModelRequirements } from '../types';

export interface IModelRouter {
  selectRequirements(task: Task, context: any): ModelRequirements;
}

export interface IReasoner {
  reason(input: any): Promise<string>;
}

export interface IPlanner {
  createPlan(task: Task): Promise<Task[]>;
}

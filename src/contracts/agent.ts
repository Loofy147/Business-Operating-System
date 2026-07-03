import { AgentMetadata, Goal, Task, ExecutionResult } from '../types';

export enum AgentState {
  Idle = 'Idle',
  Planning = 'Planning',
  Reasoning = 'Reasoning',
  ToolSelection = 'ToolSelection',
  Execution = 'Execution',
  Reflection = 'Reflection',
  Validation = 'Validation',
  MemoryUpdate = 'MemoryUpdate',
  Refining = 'Refining',
  Retrying = 'Retrying',
  Finished = 'Finished'
}

export interface IAgent {
  metadata: AgentMetadata;
  state: AgentState;
  addGoal(goal: Goal): void;
  getGoals(): Goal[];
  plan(task: Task): Promise<Task[]>;
  reason(context: any): Promise<string>;
  execute(task: Task): Promise<ExecutionResult>;
  reflect(result: ExecutionResult): Promise<void>;
}

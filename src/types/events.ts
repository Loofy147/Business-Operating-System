import { IEvent } from '../contracts/event';

export enum EventType {
  TaskCreated = 'TaskCreated',
  TaskAssigned = 'TaskAssigned',
  TaskStarted = 'TaskStarted',
  TaskCompleted = 'TaskCompleted',
  TaskFailed = 'TaskFailed',
  ToolInvoked = 'ToolInvoked',
  MemoryRead = 'MemoryRead',
  MemoryWrite = 'MemoryWrite',
  ReasoningStarted = 'ReasoningStarted',
  ReasoningCompleted = 'ReasoningCompleted',
  PolicyViolation = 'PolicyViolation',
  CostExceeded = 'CostExceeded'
}

export interface TaskEvent extends IEvent {
  type: EventType.TaskCreated | EventType.TaskAssigned | EventType.TaskStarted | EventType.TaskCompleted | EventType.TaskFailed;
  payload: {
    taskId: string;
    description?: string;
    result?: any;
    error?: string;
  };
}

export interface ToolEvent extends IEvent {
  type: EventType.ToolInvoked;
  payload: {
    toolName: string;
    args: any;
    result: any;
  };
}

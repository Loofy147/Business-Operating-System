export type AgentId = string;
export type TaskId = string;
export type EventId = string;

export interface Goal {
  description: string;
  successCriteria: string[];
}

export interface Task {
  id: TaskId;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedTo?: AgentId;
  dependencies: TaskId[];
  result?: any;
}

export interface Message {
  id: string;
  sender: AgentId;
  receiver: AgentId;
  content: string;
  timestamp: number;
}

export interface Event {
  id: EventId;
  type: string;
  source: string;
  payload: any;
  timestamp: number;
}

export interface AgentMetadata {
  id: AgentId;
  name: string;
  role: string;
  capabilities: string[];
}

export interface ModelRequirements {
  reasoningDepth: 'low' | 'medium' | 'high';
  visionRequired: boolean;
  minContextWindow: number;
  priority: 'cost' | 'latency' | 'accuracy';
}

export interface ModelConfig {
  modelName: string;
  provider: string;
  maxTokens?: number;
  temperature?: number;
}

export interface ExecutionResult {
  success: boolean;
  output: any;
  error?: string;
  metrics: {
    latency: number;
    tokens: number;
    cost: number;
  };
}

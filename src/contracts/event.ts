export interface IEvent {
  id: string;
  type: string;
  timestamp: number;
  trace_id: string;
  agent_id?: string;
  payload: any;
  metadata: any;
}

export interface IEventBus {
  publish(event: IEvent): void;
  subscribe(type: string, handler: (event: IEvent) => void): void;
}

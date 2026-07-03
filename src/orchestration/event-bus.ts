import { IEvent, IEventBus } from '../contracts/event';

export class EventBus implements IEventBus {
  private handlers: Map<string, Array<(event: IEvent) => void>> = new Map();

  public subscribe(eventType: string, handler: (event: IEvent) => void): void {
    const handlers = this.handlers.get(eventType) || [];
    handlers.push(handler);
    this.handlers.set(eventType, handlers);
  }

  public publish(event: IEvent): void {
    console.log(`[EventBus] Publishing event: ${event.type}`, { trace_id: event.trace_id });
    const handlers = this.handlers.get(event.type) || [];
    handlers.forEach(handler => handler(event));
  }
}

export const globalEventBus = new EventBus();

import { BasePlugin } from '../sdk/plugin-sdk';
import { IAgent } from '../contracts/agent';
import { IEventBus } from '../contracts/event';
import { EventType } from '../types/events';

export class MetricsPlugin extends BasePlugin {
    name = 'MetricsPlugin';
    version = '1.0.0';
    description = 'Aggregates system-wide performance metrics from the event bus';

    private metrics: Map<string, number> = new Map();
    private eventBus: IEventBus | undefined;

    public async initialize(agent: IAgent): Promise<void> {
        this.log('Initializing metrics aggregation');
        // In a real system, we'd get the event bus from the agent or a global registry
        // For this implementation, we assume initialization provides the necessary context
    }

    public attachToBus(eventBus: IEventBus): void {
        this.eventBus = eventBus;
        this.eventBus.subscribe(EventType.TaskCompleted, (event) => {
            const count = this.metrics.get('tasks_completed') || 0;
            this.metrics.set('tasks_completed', count + 1);
            this.log(`Metric updated: tasks_completed = ${count + 1}`);
        });

        this.eventBus.subscribe(EventType.TaskFailed, (event) => {
            const count = this.metrics.get('tasks_failed') || 0;
            this.metrics.set('tasks_failed', count + 1);
            this.log(`Metric updated: tasks_failed = ${count + 1}`);
        });
    }

    public getReport(): any {
        return Object.fromEntries(this.metrics);
    }
}

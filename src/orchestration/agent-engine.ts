import { IAgent } from '../contracts/agent';
import { IScheduler } from '../contracts/scheduler';
import { IEventBus } from '../contracts/event';
import { WorkflowGraph } from './workflow-graph';
import { Task, ExecutionResult } from '../types';
import { EventType } from '../types/events';

export class AgentEngine {
  private agents: Map<string, IAgent> = new Map();
  private scheduler: IScheduler;
  private eventBus: IEventBus;

  constructor(scheduler: IScheduler, eventBus: IEventBus) {
    this.scheduler = scheduler;
    this.eventBus = eventBus;
  }

  public registerAgent(agent: IAgent): void {
    this.agents.set(agent.metadata.id, agent);
  }

  public async runWorkflow(graph: WorkflowGraph): Promise<void> {
    let executableTasks = graph.getExecutableTasks();

    executableTasks.forEach(task => this.scheduler.schedule(task));

    let nextTask = this.scheduler.getNextTask();
    while (nextTask) {
      const task = nextTask;
      const agent = this.findBestAgentForTask(task);

      if (!agent) {
        this.eventBus.publish({
          id: Math.random().toString(),
          type: EventType.TaskFailed,
          timestamp: Date.now(),
          trace_id: 'internal',
          payload: { taskId: task.id, error: 'No suitable agent found' },
          metadata: {}
        });
        graph.updateTaskStatus(task.id, 'failed', 'No suitable agent found');
      } else {
        graph.updateTaskStatus(task.id, 'in_progress');
        this.eventBus.publish({
          id: Math.random().toString(),
          type: EventType.TaskStarted,
          timestamp: Date.now(),
          trace_id: 'internal',
          agent_id: agent.metadata.id,
          payload: { taskId: task.id },
          metadata: {}
        });

        const result: ExecutionResult = await agent.execute(task);

        if (result.success) {
          graph.updateTaskStatus(task.id, 'completed', result.output);
          this.eventBus.publish({
            id: Math.random().toString(),
            type: EventType.TaskCompleted,
            timestamp: Date.now(),
            trace_id: 'internal',
            agent_id: agent.metadata.id,
            payload: { taskId: task.id, result: result.output },
            metadata: {}
          });
        } else {
          graph.updateTaskStatus(task.id, 'failed', result.error);
          this.eventBus.publish({
            id: Math.random().toString(),
            type: EventType.TaskFailed,
            timestamp: Date.now(),
            trace_id: 'internal',
            agent_id: agent.metadata.id,
            payload: { taskId: task.id, error: result.error },
            metadata: {}
          });
        }
      }

      // Schedule newly unlocked tasks
      graph.getExecutableTasks().forEach(t => {
        if (t.status === 'pending') this.scheduler.schedule(t);
      });

      nextTask = this.scheduler.getNextTask();
    }
  }

  private findBestAgentForTask(task: Task): IAgent | undefined {
    if (task.assignedTo) {
      return this.agents.get(task.assignedTo);
    }
    return Array.from(this.agents.values())[0];
  }
}

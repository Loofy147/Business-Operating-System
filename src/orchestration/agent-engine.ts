import { IAgent } from '../contracts/agent';
import { IScheduler } from '../contracts/scheduler';
import { IEventBus } from '../contracts/event';
import { WorkflowGraph } from './workflow-graph';
import { Task, ExecutionResult } from '../types';
import { EventType } from '../types/events';
import { agentRegistry } from '../registry/capability-registry';

export class AgentEngine {
  private scheduler: IScheduler;
  private eventBus: IEventBus;

  constructor(scheduler: IScheduler, eventBus: IEventBus) {
    this.scheduler = scheduler;
    this.eventBus = eventBus;
  }

  public registerAgent(agent: IAgent): void {
    agentRegistry.register(agent.metadata.id, agent);
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

        if (result.subtasks && result.subtasks.length > 0) {
          result.subtasks.forEach(st => {
            st.dependencies = st.dependencies.map(depId => depId.startsWith("parent:") ? task.id : depId);
            graph.addTask(st);
          });
        }
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
      return agentRegistry.get(task.assignedTo);
    }

    const agents = agentRegistry.list().map(id => agentRegistry.get(id)!);

    // Simple capability matching
    const matchingAgent = agents.find(agent => {
        const description = task.description.toLowerCase();
        return agent.metadata.capabilities.some(cap => description.includes(cap.toLowerCase()));
    });

    return matchingAgent || agents[0];
  }
}

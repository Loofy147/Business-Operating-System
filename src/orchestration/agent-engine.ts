import { IAgent } from '../contracts/agent';
import { IScheduler } from '../contracts/scheduler';
import { IEventBus } from '../contracts/event';
import { WorkflowGraph } from './workflow-graph';
import { Task, ExecutionResult } from '../types';
import { EventType } from '../types/events';
import { agentRegistry, pluginRegistry } from '../registry/capability-registry';

export class AgentEngine {
  private scheduler: IScheduler;
  private eventBus: IEventBus;
  private activeWorkflows: Set<WorkflowGraph> = new Set();
  private initialized: boolean = false;

  constructor(scheduler: IScheduler, eventBus: IEventBus) {
    this.scheduler = scheduler;
    this.eventBus = eventBus;
    this.setupEventWatchers();
  }

  public registerAgent(agent: IAgent): void {
    agentRegistry.register(agent.metadata.id, agent);
  }

  public async initializePlugins(): Promise<void> {
      if (this.initialized) return;

      const pluginIds = pluginRegistry.list();
      console.log(`[AgentEngine] Initializing ${pluginIds.length} plugins`);

      for (const id of pluginIds) {
          const plugin = pluginRegistry.get(id);
          if (plugin) {
              // Initializing with first available agent as dummy if needed,
              // but real plugins should be agent-agnostic or kernel-specific
              const dummyAgent = agentRegistry.list().length > 0
                ? agentRegistry.get(agentRegistry.list()[0]!)
                : undefined;

              if (dummyAgent) {
                await plugin.initialize(dummyAgent);
              }

              // Custom hook for EventBus attachment if supported
              if ('attachToBus' in (plugin as any)) {
                  (plugin as any).attachToBus(this.eventBus);
              }
          }
      }
      this.initialized = true;
  }

  private setupEventWatchers(): void {
    this.eventBus.subscribe(EventType.TaskFailed, async (event) => {
        console.log(`[AgentEngine] Watcher detected failure: ${event.payload.taskId}`);
    });

    this.eventBus.subscribe(EventType.TaskCreated, (event) => {
        console.log(`[AgentEngine] Watcher detected new task: ${event.payload.taskId}`);
    });
  }

  public async runWorkflow(graph: WorkflowGraph): Promise<void> {
    await this.initializePlugins();
    this.activeWorkflows.add(graph);

    let executableTasks = graph.getExecutableTasks();
    executableTasks.forEach(task => this.scheduler.schedule(task));

    let nextTask = this.scheduler.getNextTask();
    while (nextTask) {
      const task = nextTask;
      const agent = this.findBestAgentForTask(task);

      if (!agent) {
        this.handleNoAgentFound(task, graph);
      } else {
        await this.executeTask(task, agent, graph);
      }

      graph.getExecutableTasks().forEach(t => {
        if (t.status === 'pending') this.scheduler.schedule(t);
      });

      nextTask = this.scheduler.getNextTask();
    }

    this.activeWorkflows.delete(graph);
  }

  private async executeTask(task: Task, agent: IAgent, graph: WorkflowGraph): Promise<void> {
    graph.updateTaskStatus(task.id, 'in_progress');
    this.eventBus.publish({
      id: Math.random().toString(),
      type: EventType.TaskStarted,
      timestamp: Date.now(),
      trace_id: (task as any).trace_id || 'internal',
      agent_id: agent.metadata.id,
      payload: { taskId: task.id },
      metadata: {}
    });

    const result: ExecutionResult = await agent.execute(task);

    if (result.subtasks && result.subtasks.length > 0) {
      result.subtasks.forEach(st => {
        st.dependencies = st.dependencies.map(depId => depId.startsWith("parent:") ? task.id : depId);
        (st as any).trace_id = (task as any).trace_id;
        graph.addTask(st);
        this.eventBus.publish({
            id: Math.random().toString(),
            type: EventType.TaskCreated,
            timestamp: Date.now(),
            trace_id: (task as any).trace_id || 'internal',
            payload: { taskId: st.id, description: st.description },
            metadata: {}
        });
      });
    }

    if (result.success) {
      graph.updateTaskStatus(task.id, 'completed', result.output);
      this.eventBus.publish({
        id: Math.random().toString(),
        type: EventType.TaskCompleted,
        timestamp: Date.now(),
        trace_id: (task as any).trace_id || 'internal',
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
        trace_id: (task as any).trace_id || 'internal',
        agent_id: agent.metadata.id,
        payload: { taskId: task.id, error: result.error },
        metadata: {}
      });
    }
  }

  private handleNoAgentFound(task: Task, graph: WorkflowGraph): void {
    this.eventBus.publish({
        id: Math.random().toString(),
        type: EventType.TaskFailed,
        timestamp: Date.now(),
        trace_id: (task as any).trace_id || 'internal',
        payload: { taskId: task.id, error: 'No suitable agent found' },
        metadata: {}
      });
      graph.updateTaskStatus(task.id, 'failed', 'No suitable agent found');
  }

  private findBestAgentForTask(task: Task): IAgent | undefined {
    if (task.assignedTo) {
      return agentRegistry.get(task.assignedTo);
    }

    // Optimized lookup via capability index
    const description = task.description.toLowerCase();
    const possibleAgents: IAgent[] = [];

    // Search for any capability keyword in the task description
    const allCapabilities = (agentRegistry as any).index.keys();
    for (const cap of allCapabilities) {
        if (description.includes(cap)) {
            const agents = agentRegistry.findByCapability(cap);
            possibleAgents.push(...agents);
        }
    }

    if (possibleAgents.length > 0) {
        // Return the first match or use a more complex arbitration if needed
        return possibleAgents[0];
    }

    const agents = agentRegistry.list();
    return agents.length > 0 ? agentRegistry.get(agents[0]!) : undefined;
  }
}

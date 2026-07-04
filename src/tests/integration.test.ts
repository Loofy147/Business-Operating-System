import { AgentKernel } from '../agents/kernel';
import { AgentEngine } from '../orchestration/agent-engine';
import { WorkflowGraph } from '../orchestration/workflow-graph';
import { Scheduler } from '../orchestration/scheduler';
import { EventBus } from '../orchestration/event-bus';
import { Task } from '../types';

describe('AI-BOS Integration (Contract-based)', () => {
  it('should run a workflow using scheduler and event bus', async () => {
    const eventBus = new EventBus();
    const scheduler = new Scheduler();
    const engine = new AgentEngine(scheduler, eventBus);

    const agent = new AgentKernel({
      id: 'a1',
      name: 'Agent 1',
      role: 'Generalist',
      capabilities: ['all']
    }, { eventBus });

    engine.registerAgent(agent);

    const graph = new WorkflowGraph();
    const task1: Task = {
      id: 't1',
      description: 'First task',
      status: 'pending',
      dependencies: []
    };
    graph.addTask(task1);

    const events: string[] = [];
    eventBus.subscribe('TaskStarted', (e) => events.push(e.type));
    eventBus.subscribe('TaskCompleted', (e) => events.push(e.type));

    await engine.runWorkflow(graph);

    expect(graph.getTask('t1')?.status).toBe('completed');
    expect(events).toContain('TaskStarted');
    expect(events).toContain('TaskCompleted');

    // Small delay to let any internal state transitions finish
    await new Promise(resolve => setTimeout(resolve, 50));
  });
});

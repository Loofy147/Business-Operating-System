import { AgentKernel } from '../agents/kernel';
import { AgentEngine } from '../orchestration/agent-engine';
import { WorkflowGraph } from '../orchestration/workflow-graph';
import { Scheduler } from '../orchestration/scheduler';
import { EventBus } from '../orchestration/event-bus';
import { Planner } from '../intelligence/planner';
import { Task } from '../types';

describe('AI-BOS Refinement Flow', () => {
  it('should refine a task into subtasks on failure and execute them', async () => {
    const eventBus = new EventBus();
    const scheduler = new Scheduler();
    const engine = new AgentEngine(scheduler, eventBus);
    const planner = new Planner();

    const agent = new AgentKernel({
      id: 'a1',
      name: 'Agent 1',
      role: 'Generalist',
      capabilities: ['all']
    }, { eventBus, planner });

    // Mock agent to fail first then succeed
    let executionCount = 0;
    const originalExecute = agent.execute.bind(agent);
    agent.execute = async (task: Task) => {
        executionCount++;
        if (task.id === 't1') {
            // Force failure after max retries to trigger refinement
            return {
                success: false,
                output: null,
                error: "Force failure",
                subtasks: await agent.plan(task),
                metrics: { latency: 0, tokens: 0, cost: 0 }
            };
        }
        return originalExecute(task);
    };

    engine.registerAgent(agent);

    const graph = new WorkflowGraph();
    const task1: Task = {
      id: 't1',
      description: 'Root task',
      status: 'pending',
      dependencies: []
    };
    graph.addTask(task1);

    await engine.runWorkflow(graph);

    expect(graph.getTask('t1')?.status).toBe('failed');
    expect(graph.getTask('t1-1')?.status).toBe('completed');
    expect(graph.getTask('t1-2')?.status).toBe('completed');
  });
});

import { AgentEngine } from '../orchestration/agent-engine';
import { Scheduler } from '../orchestration/scheduler';
import { EventBus } from '../orchestration/event-bus';
import { WorkflowGraph } from '../orchestration/workflow-graph';
import { AgentKernel } from '../agents/kernel';
import { Task } from '../types';

describe('Event-Driven Orchestration', () => {
  it('should publish TaskCreated events when subtasks are generated', async () => {
    const scheduler = new Scheduler();
    const eventBus = new EventBus();
    const engine = new AgentEngine(scheduler, eventBus);
    const graph = new WorkflowGraph();

    const agent = new AgentKernel({
        id: 'a1',
        name: 'Test Agent',
        role: 'Tester',
        capabilities: []
    }, { eventBus });
    engine.registerAgent(agent);

    // Mock planner to return subtasks
    (agent as any).planner = {
        createPlan: jest.fn().mockResolvedValue([
            { id: 'sub-1', description: 'Subtask 1', status: 'pending', dependencies: [] }
        ])
    };

    const task: Task = {
        id: 'parent',
        description: 'Task with subtasks',
        status: 'pending',
        dependencies: []
    };
    graph.addTask(task);

    const eventSpy = jest.fn();
    eventBus.subscribe('TaskCreated', eventSpy);

    // Force failure to trigger refinement and subtask generation
    (task as any).testOutput = 'Failed result';

    await engine.runWorkflow(graph);

    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        type: 'TaskCreated',
        payload: expect.objectContaining({ taskId: 'sub-1' })
    }));
  });
});

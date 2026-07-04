import { Gateway } from '../gateway/gateway';
import { AgentEngine } from '../orchestration/agent-engine';
import { Scheduler } from '../orchestration/scheduler';
import { EventBus } from '../orchestration/event-bus';
import { WorkflowGraph } from '../orchestration/workflow-graph';
import { AgentKernel } from '../agents/kernel';
import { Task } from '../types';

describe('System-Wide Traceability', () => {
  it('should propagate traceId from Gateway through the entire execution lifecycle', async () => {
    const gateway = new Gateway();
    gateway.authenticate('secret-token');

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

    const task: Task = { id: 't1', description: 'test', status: 'pending', dependencies: [] };

    // 1. Gateway generates traceId
    gateway.routeTask(task, 'user-1');
    const traceId = (task as any).trace_id;
    expect(traceId).toBeDefined();

    graph.addTask(task);

    const eventSpy = jest.fn();
    eventBus.subscribe('TaskStarted', eventSpy);
    eventBus.subscribe('TaskCompleted', eventSpy);

    // 2. Engine and Kernel use the same traceId
    await engine.runWorkflow(graph);

    expect(eventSpy).toHaveBeenCalledWith(expect.objectContaining({
        trace_id: traceId
    }));

    console.log('Traceability verified for traceId:', traceId);
  });
});

import { AgentEngine } from '../orchestration/agent-engine';
import { Scheduler } from '../orchestration/scheduler';
import { EventBus } from '../orchestration/event-bus';
import { WorkflowGraph } from '../orchestration/workflow-graph';
import { AgentKernel } from '../agents/kernel';
import { pluginRegistry } from '../registry/capability-registry';
import { MetricsPlugin } from '../plugins/metrics-plugin';
import { Task } from '../types';

describe('Plugin Lifecycle', () => {
  it('should initialize plugins and aggregate metrics via EventBus', async () => {
    const scheduler = new Scheduler();
    const eventBus = new EventBus();
    const engine = new AgentEngine(scheduler, eventBus);
    const graph = new WorkflowGraph();

    const metricsPlugin = new MetricsPlugin();
    pluginRegistry.register('metrics', metricsPlugin);

    const agent = new AgentKernel({
        id: 'a1',
        name: 'Test Agent',
        role: 'Tester',
        capabilities: []
    }, { eventBus });
    engine.registerAgent(agent);

    const task: Task = { id: 't1', description: 'test', status: 'pending', dependencies: [] };
    (task as any).testOutput = 'Task completed successfully';
    graph.addTask(task);

    await engine.runWorkflow(graph);

    const report = metricsPlugin.getReport();
    expect(report.tasks_completed).toBe(1);
    console.log('Plugin Report:', report);
  });
});

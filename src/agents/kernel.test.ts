import { AgentKernel } from './kernel';
import { AgentState } from '../contracts/agent';
import { Task } from '../types';
import { ModelRouter } from '../intelligence/model-router';
import { CostOptimizer } from '../optimization/cost-optimizer';

describe('AgentKernel', () => {
  let kernel: AgentKernel;
  const metadata = { id: 'a1', name: 'Test Agent', role: 'Tester', capabilities: ['test'] };

  beforeEach(() => {
    kernel = new AgentKernel(metadata, {
      modelRouter: new ModelRouter(),
      modelOptimizer: new CostOptimizer()
    });
  });

  it('should initialize in Idle state', () => {
    expect(kernel.state).toBe(AgentState.Idle);
  });

  it('should transition to Planning when plan is called', async () => {
    const task: Task = { id: 't1', description: 'test', status: 'pending', dependencies: [] };
    await kernel.plan(task);
    expect(kernel.state).toBe(AgentState.Planning);
  });

  it('should transition through states during execution', async () => {
    const task: Task = { id: 't1', description: 'test', status: 'pending', dependencies: [] };

    // Mock Math.random to always succeed for this test
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9);

    await kernel.execute(task);
    // Small delay to allow the Idle transition to happen
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(kernel.state).toBe(AgentState.Idle);

    spy.mockRestore();
  });

  it('should retry on failure and eventually refine', async () => {
    const task: Task = { id: 't1', description: 'test', status: 'pending', dependencies: [] };

    // Mock Math.random to always fail
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const states: AgentState[] = [];
    const originalSetState = (kernel as any).setState.bind(kernel);
    (kernel as any).setState = (state: AgentState) => {
      states.push(state);
      originalSetState(state);
    };

    await kernel.execute(task);

    expect(states).toContain(AgentState.Retrying);
    expect(states).toContain(AgentState.Refining);

    spy.mockRestore();
  });
});

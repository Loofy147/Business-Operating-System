import { AgentKernel } from './kernel';
import { AgentState } from '../contracts/agent';
import { Task } from '../types';
import { ModelRouter } from '../intelligence/model-router';
import { CostOptimizer } from '../optimization/cost-optimizer';
import { PolicyEngine } from '../governance/policy-engine';

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

  it('should reject tasks rejected by PolicyEngine', async () => {
    const policyEngine = new PolicyEngine();
    kernel = new AgentKernel(metadata, { policyEngine });

    const task: Task = { id: 't1', description: 'restricted action', status: 'pending', dependencies: [] };
    await expect(kernel.plan(task)).rejects.toThrow('Task rejected by Policy Engine');
  });

  it('should fail execution if post-execution check fails', async () => {
    const policyEngine = new PolicyEngine();
    kernel = new AgentKernel(metadata, {
      policyEngine,
      modelRouter: new ModelRouter(),
      modelOptimizer: new CostOptimizer()
    });

    const task: any = { id: 't1', description: 'test', status: 'pending', dependencies: [], testOutput: 'Here is sensitive data' };

    // Mock success of execution logic
    const spy = jest.spyOn(Math, 'random').mockReturnValue(0.9);

    const result = await kernel.execute(task);
    expect(result.success).toBe(false);
    expect(result.error).toContain('sensitive data exposure');

    spy.mockRestore();
  });
});

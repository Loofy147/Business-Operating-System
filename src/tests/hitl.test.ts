import { AgentKernel } from '../agents/kernel';
import { PolicyEngine } from '../governance/policy-engine';
import { hitlRegistry } from '../governance/hitl-registry';
import { Task } from '../types';

describe('HITL (Human-In-The-Loop) Integration', () => {
  it('should wait for human approval when policy engine requires HITL', async () => {
    const policyEngine = new PolicyEngine();
    const agent = new AgentKernel({
      id: 'a1',
      name: 'Test Agent',
      role: 'Tester',
      capabilities: []
    }, {
      policyEngine
    });

    const highRiskTask: Task = {
      id: 't-high-risk',
      description: 'Perform a financial PII operation', // Triggers high risk in PolicyEngine mock
      status: 'pending',
      dependencies: []
    };

    // Start planning in background
    const planPromise = agent.plan(highRiskTask);

    // Give it a moment to enter the wait loop
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify it created a request and is pending
    const requests = (hitlRegistry as any).requests;
    const requestId = Array.from(requests.keys())[0] as string;
    expect(hitlRegistry.getStatus(requestId)).toBe('pending');

    // Approve the request
    hitlRegistry.approve(requestId);

    // Wait for plan to complete
    const subtasks = await planPromise;
    expect(subtasks).toBeDefined();
    console.log('HITL Approval Test Passed');
  });

  it('should throw error when human rejects the task', async () => {
    const policyEngine = new PolicyEngine();
    const agent = new AgentKernel({
        id: 'a2',
        name: 'Test Agent 2',
        role: 'Tester',
        capabilities: []
      }, {
        policyEngine
      });

      const highRiskTask: Task = {
        id: 't-high-risk-2',
        description: 'Perform a financial PII operation',
        status: 'pending',
        dependencies: []
      };

      const planPromise = agent.plan(highRiskTask);
      await new Promise(resolve => setTimeout(resolve, 100));

      const requests = (hitlRegistry as any).requests;
      const requestId = Array.from(requests.keys()).find(id => (requests.get(id) as any).taskId === 't-high-risk-2') as string;

      hitlRegistry.reject(requestId);

      await expect(planPromise).rejects.toThrow('Task rejected by human operator');
  });
});

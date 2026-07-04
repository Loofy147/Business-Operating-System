import { PolicyEngine } from '../governance/policy-engine';
import { Task } from '../types';

describe('IAM Governance Integration', () => {
  it('should block execution if IAM permission check fails', () => {
    const policyEngine = new PolicyEngine();
    const task: Task = {
        id: 't1',
        description: 'Execute sensitive tool',
        status: 'pending',
        dependencies: []
    };

    // 'execute' on 'slack-send' for role 'user' is false in iam.ts mock
    const result = policyEngine.preExecutionCheck(task, { tool: 'slack-send' });
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('IAM Violation');
  });

  it('should allow execution if IAM permission check passes', () => {
    const policyEngine = new PolicyEngine();
    const task: Task = {
        id: 't2',
        description: 'Generic task',
        status: 'pending',
        dependencies: []
    };

    // Generic execution is allowed for 'user'
    const result = policyEngine.preExecutionCheck(task, { tool: 'generic-execution' });
    expect(result.allowed).toBe(true);
  });
});

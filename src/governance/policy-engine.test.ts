import { PolicyEngine } from './policy-engine';
import { Task, ExecutionResult } from '../types';

describe('PolicyEngine', () => {
  let policyEngine: PolicyEngine;

  beforeEach(() => {
    policyEngine = new PolicyEngine();
  });

  it('should reject tasks with restricted keywords', () => {
    const task: Task = { id: 't1', description: 'restricted action', status: 'pending', dependencies: [] };
    const result = policyEngine.validateRequest(task);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('restricted keywords');
  });

  it('should flag tasks for HITL if risk is high', () => {
    const task: Task = { id: 't1', description: 'financial transaction', status: 'pending', dependencies: [] };
    const result = policyEngine.validateRequest(task);
    expect(result.allowed).toBe(true);
    expect(result.requiresHITL).toBe(true);
    expect(result.riskAssessment?.financialScore).toBe(4);
  });

  it('should reject execution results that contain sensitive data', () => {
    const result: ExecutionResult = {
      success: true,
      output: 'Here is some sensitive data',
      metrics: { latency: 0, tokens: 0, cost: 0 }
    };
    const validation = policyEngine.postExecutionCheck(result, {});
    expect(validation.allowed).toBe(false);
    expect(validation.reason).toContain('sensitive data exposure');
  });
});

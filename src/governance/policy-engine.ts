import { Task, PolicyValidationResult, ExecutionResult, RiskAssessment } from '../types';
import { IPolicyEngine } from '../contracts/governance';
import { IAM, User } from './iam';

export class PolicyEngine implements IPolicyEngine {
  private globalPolicies: string[] = [];

  public addGlobalPolicy(policy: string): void {
    this.globalPolicies.push(policy);
  }

  public validateRequest(task: Task): PolicyValidationResult {
    const risk = this.performRiskAssessment(task);
    const totalScore = risk.privacyScore + risk.operationalScore + risk.financialScore + risk.safetyScore;

    if (totalScore > 12 || risk.privacyScore >= 4 || risk.operationalScore >= 4 || risk.financialScore >= 4 || risk.safetyScore >= 4) {
      return {
        allowed: true,
        reason: 'Task requires human-in-the-loop (HITL) approval due to high risk score',
        riskAssessment: risk,
        requiresHITL: true
      };
    }

    if (task.description.toLowerCase().includes('restricted')) {
      return { allowed: false, reason: 'Task contains restricted keywords', riskAssessment: risk };
    }

    return { allowed: true, riskAssessment: risk };
  }

  public preExecutionCheck(task: Task, context: any): PolicyValidationResult {
    console.log('[PolicyEngine] Performing pre-execution check');

    // IAM Integration: Check if the user (or agent acting as user) has permission for the resource
    const mockUser: User = { id: 'agent-1', roles: ['user'] }; // In real system, this comes from context
    const resource = context.tool || 'generic-execution';

    const isAllowed = IAM.checkPermission(mockUser, resource, 'execute');

    if (!isAllowed) {
        return {
            allowed: false,
            reason: `IAM Violation: User ${mockUser.id} does not have permission to execute ${resource}`
        };
    }

    return { allowed: true };
  }

  public postExecutionCheck(result: ExecutionResult, context: any): PolicyValidationResult {
    // Check for safety and alignment in the output
    console.log('[PolicyEngine] Performing post-execution safety check');
    if (result.output && typeof result.output === 'string' && result.output.toLowerCase().includes('sensitive data')) {
      return { allowed: false, reason: 'Post-execution check failed: Potential sensitive data exposure detected' };
    }
    return { allowed: true };
  }

  private performRiskAssessment(task: Task): RiskAssessment {
    // Mock risk assessment logic
    let scores = {
      privacyScore: 1,
      operationalScore: 1,
      financialScore: 1,
      safetyScore: 1
    };

    if (task.description.toLowerCase().includes('financial')) scores.financialScore = 4;
    if (task.description.toLowerCase().includes('database')) scores.operationalScore = 3;
    if (task.description.toLowerCase().includes('pii')) scores.privacyScore = 5;

    return scores;
  }
}

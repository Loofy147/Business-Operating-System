import { Task } from '../types';

export class PolicyEngine {
  private globalPolicies: string[] = [];

  public addGlobalPolicy(policy: string): void {
    this.globalPolicies.push(policy);
  }

  public validateTask(task: Task): { allowed: boolean; reason?: string } {
    // Basic policy validation logic
    if (task.description.toLowerCase().includes('restricted')) {
      return { allowed: false, reason: 'Task contains restricted keywords' };
    }
    return { allowed: true };
  }
}

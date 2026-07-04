export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface ApprovalRequest {
  id: string;
  taskId: string;
  agentId: string;
  reason: string;
  status: ApprovalStatus;
  timestamp: number;
}

export class HITLRegistry {
  private requests: Map<string, ApprovalRequest> = new Map();

  public createRequest(taskId: string, agentId: string, reason: string): string {
    const id = Math.random().toString(36).substring(7);
    this.requests.set(id, {
      id,
      taskId,
      agentId,
      reason,
      status: 'pending',
      timestamp: Date.now()
    });
    console.log(`[HITLRegistry] Created approval request ${id} for task ${taskId}`);
    return id;
  }

  public getStatus(id: string): ApprovalStatus {
    return this.requests.get(id)?.status || 'pending';
  }

  public approve(id: string): void {
    const request = this.requests.get(id);
    if (request) {
      request.status = 'approved';
      console.log(`[HITLRegistry] Request ${id} approved`);
    }
  }

  public reject(id: string): void {
    const request = this.requests.get(id);
    if (request) {
      request.status = 'rejected';
      console.log(`[HITLRegistry] Request ${id} rejected`);
    }
  }
}

export const hitlRegistry = new HITLRegistry();

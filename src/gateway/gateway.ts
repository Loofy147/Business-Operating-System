import { Task } from '../types';

export class Gateway {
  private activeSessions: Set<string> = new Set();
  private requestCounts: Map<string, { count: number, lastReset: number }> = new Map();
  private readonly RATE_LIMIT = 5;
  private readonly WINDOW_MS = 60000;

  public authenticate(token: string): boolean {
    if (token === 'secret-token') {
      this.activeSessions.add('user-1');
      return true;
    }
    return false;
  }

  public routeTask(task: Task, sessionId: string): string {
    if (!this.activeSessions.has(sessionId)) {
        throw new Error('Unauthorized session');
    }

    if (this.isRateLimited(sessionId)) {
        throw new Error('Rate limit exceeded. Please try again later.');
    }

    // System-wide Traceability: Ensure every task has a traceId from the gateway
    if (!(task as any).trace_id) {
        (task as any).trace_id = `trace-${Math.random().toString(36).substring(7)}`;
        console.log(`[Gateway] Generated new traceId: ${(task as any).trace_id}`);
    }

    console.log(`[Gateway] Routing task ${task.id} through gateway for session ${sessionId}`);
    return 'orchestrator-1';
  }

  private isRateLimited(sessionId: string): boolean {
    const now = Date.now();
    const sessionData = this.requestCounts.get(sessionId) || { count: 0, lastReset: now };

    if (now - sessionData.lastReset > this.WINDOW_MS) {
        sessionData.count = 1;
        sessionData.lastReset = now;
        this.requestCounts.set(sessionId, sessionData);
        return false;
    }

    sessionData.count++;
    this.requestCounts.set(sessionId, sessionData);

    return sessionData.count > this.RATE_LIMIT;
  }
}

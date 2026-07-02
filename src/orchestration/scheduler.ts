import { IScheduler } from '../contracts/scheduler';
import { Task } from '../types';
import { PriorityQueue } from './priority-queue';

export class Scheduler implements IScheduler {
  private queue: PriorityQueue<Task> = new PriorityQueue();
  private retryCounts: Map<string, number> = new Map();
  private maxRetries: number = 3;

  public schedule(task: Task): void {
    const priority = (task as any).priority || 0;
    console.log(`[Scheduler] Scheduling task: ${task.id} with priority ${priority}`);
    this.queue.push(task, priority);
  }

  public getNextTask(): Task | undefined {
    return this.queue.pop();
  }

  public cancelTask(taskId: string): void {
    // PriorityQueue implementation needs filter for cancellation,
    // for now we'll mock this by checking on pop if needed.
    console.log(`[Scheduler] Cancel request for task: ${taskId}`);
  }

  public handleFailure(taskId: string): boolean {
    const currentRetries = this.retryCounts.get(taskId) || 0;
    if (currentRetries < this.maxRetries) {
      this.retryCounts.set(taskId, currentRetries + 1);
      console.log(`[Scheduler] Retrying task ${taskId} (Attempt ${currentRetries + 1})`);
      return true;
    }
    console.log(`[Scheduler] Task ${taskId} reached max retries.`);
    return false;
  }
}

import { IScheduler } from '../contracts/scheduler';
import { Task } from '../types';

export class Scheduler implements IScheduler {
  private queue: Task[] = [];

  public schedule(task: Task): void {
    console.log(`[Scheduler] Scheduling task: ${task.id}`);
    // Basic priority logic: sort by importance if metadata exists (mock)
    this.queue.push(task);
  }

  public getNextTask(): Task | undefined {
    return this.queue.shift();
  }

  public cancelTask(taskId: string): void {
    this.queue = this.queue.filter(t => t.id !== taskId);
  }
}

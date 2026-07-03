import { Scheduler } from '../orchestration/scheduler';
import { Task } from '../types';

describe('Scheduler', () => {
  it('should schedule and pop tasks based on priority', () => {
    const scheduler = new Scheduler();
    const task1: any = { id: 't1', priority: 10 };
    const task2: any = { id: 't2', priority: 20 };

    scheduler.schedule(task1);
    scheduler.schedule(task2);

    expect(scheduler.getNextTask()?.id).toBe('t2');
    expect(scheduler.getNextTask()?.id).toBe('t1');
  });

  it('should cancel tasks', () => {
    const scheduler = new Scheduler();
    const task1: any = { id: 't1', priority: 10 };
    const task2: any = { id: 't2', priority: 20 };

    scheduler.schedule(task1);
    scheduler.schedule(task2);

    scheduler.cancelTask('t2');

    expect(scheduler.getNextTask()?.id).toBe('t1');
    expect(scheduler.getNextTask()).toBeUndefined();
  });
});

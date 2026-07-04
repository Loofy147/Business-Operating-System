import { IPlanner } from '../contracts/intelligence';
import { Task } from '../types';

export class Planner implements IPlanner {
  public async createPlan(task: Task): Promise<Task[]> {
    console.log(`[Planner] Creating plan for task: ${task.id}`);
    // Mock logic to decompose task
    return [
      { id: `${task.id}-1`, description: `Subtask 1 for ${task.description}`, status: 'pending', dependencies: [] },
      { id: `${task.id}-2`, description: `Subtask 2 for ${task.description}`, status: 'pending', dependencies: ["parent:"] }
    ];
  }
}

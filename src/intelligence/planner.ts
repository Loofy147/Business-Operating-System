import { IPlanner } from '../contracts/intelligence';
import { Task } from '../types';

export class Planner implements IPlanner {
  public async createPlan(task: Task): Promise<Task[]> {
    console.log(`[Planner] Creating plan for task: ${task.id}`);

    const description = task.description.toLowerCase();

    // Keyword-based decomposition
    if (description.includes('research') && description.includes('report')) {
        return [
            { id: `${task.id}-1`, description: `Search for information about ${task.description}`, status: 'pending', dependencies: [] },
            { id: `${task.id}-2`, description: `Synthesize findings into a report`, status: 'pending', dependencies: [`${task.id}-1`] }
        ];
    }

    if (description.includes('audit') || description.includes('fix')) {
        return [
            { id: `${task.id}-1`, description: `Scan codebase for structural weaknesses`, status: 'pending', dependencies: [] },
            { id: `${task.id}-2`, description: `Apply fixes to identified issues`, status: 'pending', dependencies: [`${task.id}-1`] },
            { id: `${task.id}-3`, description: `Verify fixes with tests`, status: 'pending', dependencies: [`${task.id}-2`] }
        ];
    }

    // Default simple decomposition
    return [
      { id: `${task.id}-1`, description: `Initial processing for ${task.description}`, status: 'pending', dependencies: [] },
      { id: `${task.id}-2`, description: `Final validation for ${task.description}`, status: 'pending', dependencies: ["parent:"] }
    ];
  }
}

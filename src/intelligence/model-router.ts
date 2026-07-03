import { ModelRequirements, Task } from '../types';
import { IModelRouter } from '../contracts/intelligence';

export class ModelRouter implements IModelRouter {
  public selectRequirements(task: Task, context: any = {}): ModelRequirements {
    // Logic to determine model requirements based on task complexity

    const isComplex = task.description.toLowerCase().includes('reasoning') || task.description.length > 500;
    const needsVision = task.description.toLowerCase().includes('vision');

    return {
      reasoningDepth: isComplex ? 'high' : 'low',
      visionRequired: needsVision,
      minContextWindow: task.description.length > 1000 ? 32000 : 8000,
      priority: 'cost'
    };
  }

  // NOTE: rates are placeholders and will drift — pull live from the provider's
  // pricing endpoint/docs at call time or refresh on deploy, don't hardcode in source.
  public static getCostEstimate(model: string, tokens: number): number {
    const rates: Record<string, number> = {
      'gemini-3.1-pro': 0.0000035, // UNVERIFIED placeholder
      'gemini-3.5-flash': 0.0000015 // UNVERIFIED placeholder
    };
    return (rates[model] || 0) * tokens;
  }
}

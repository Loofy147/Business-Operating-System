import { ModelConfig, Task } from '../types';

export class ModelRouter {
  public static selectModel(task: Task, context: any = {}): ModelConfig {
    // Basic logic for model routing

    if (task.description.toLowerCase().includes('reasoning') || task.description.length > 500) {
      return {
        modelName: 'gemini-1.5-pro',
        provider: 'google',
        temperature: 0.7
      };
    }

    if (task.description.toLowerCase().includes('vision')) {
      return {
        modelName: 'gemini-1.5-flash', // Or a specific vision model
        provider: 'google'
      };
    }

    // Default to a fast, cheap model
    return {
      modelName: 'gemini-1.5-flash',
      provider: 'google',
      temperature: 0.2
    };
  }

  public static getCostEstimate(model: string, tokens: number): number {
    const rates: Record<string, number> = {
      'gemini-1.5-pro': 0.0000035, // per token (hypothetical)
      'gemini-1.5-flash': 0.00000035
    };
    return (rates[model] || 0) * tokens;
  }
}

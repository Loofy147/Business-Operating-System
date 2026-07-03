import { ModelConfig, Task } from '../types';

export class ModelRouter {
  public static selectModel(task: Task, context: any = {}): ModelConfig {
    // Basic logic for model routing

    if (task.description.toLowerCase().includes('reasoning') || task.description.length > 500) {
      return {
        modelName: 'gemini-3.1-pro',
        provider: 'google',
        temperature: 0.7
      };
    }

    if (task.description.toLowerCase().includes('vision')) {
      return {
        modelName: 'gemini-3.5-flash', // Or a specific vision model
        provider: 'google'
      };
    }

    // Default to a fast, cheap model
    return {
      modelName: 'gemini-3.5-flash',
      provider: 'google',
      temperature: 0.2
    };
  }

  // NOTE: rates are placeholders and will drift — pull live from the provider's
  // pricing endpoint/docs at call time or refresh on deploy, don't hardcode in source.
  public static getCostEstimate(model: string, tokens: number): number {
    const rates: Record<string, number> = {
      'gemini-3.1-pro': 0.0000035, // UNVERIFIED placeholder — confirm against current pricing
      'gemini-3.5-flash': 0.0000015 // UNVERIFIED placeholder — confirm against current pricing
    };
    return (rates[model] || 0) * tokens;
  }
}

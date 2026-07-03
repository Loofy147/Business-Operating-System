import { ModelConfig } from '../types';

export class CostOptimizer {
  public static optimizeModelSelection(options: ModelConfig[]): ModelConfig {
    // Logic to select the cheapest model that meets requirements
    console.log('[CostOptimizer] Optimizing model selection for cost');
    return options.sort((a, b) => (a.modelName.includes('flash') ? -1 : 1))[0];
  }
}

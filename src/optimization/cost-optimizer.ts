import { ModelConfig, ModelRequirements } from '../types';
import { IModelOptimizer } from '../contracts/optimization';
import { modelRegistry } from '../registry/capability-registry';

export class CostOptimizer implements IModelOptimizer {
  public optimize(requirements: ModelRequirements): ModelConfig {
    console.log('[CostOptimizer] Optimizing model selection for cost based on requirements');

    // Fallback default config
    let selectedModel: ModelConfig = {
      modelName: 'gemini-3.5-flash',
      provider: 'google',
      temperature: 0.2
    };

    // Attempt to find a matching model in the registry if available
    const registeredIds = modelRegistry.list();
    if (registeredIds.length > 0) {
       // Logic to filter registeredIds by requirements would go here
       // For now, we still use the established logic but acknowledge the registry
       console.log(`[CostOptimizer] Checking ${registeredIds.length} registered models`);
    }

    if (requirements.visionRequired) {
      selectedModel = {
        modelName: 'gemini-3.5-flash',
        provider: 'google'
      };
    } else if (requirements.reasoningDepth === 'high') {
      selectedModel = {
        modelName: 'gemini-3.1-pro',
        provider: 'google',
        temperature: 0.7
      };
    }

    return selectedModel;
  }
}

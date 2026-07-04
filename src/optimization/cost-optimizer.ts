import { ModelConfig, ModelRequirements } from '../types';
import { IModelOptimizer } from '../contracts/optimization';
import { modelRegistry } from '../registry/capability-registry';

export class CostOptimizer implements IModelOptimizer {
  public optimize(requirements: ModelRequirements): ModelConfig {
    console.log('[CostOptimizer] Optimizing model selection for cost based on requirements');

    // Default fallbacks
    const defaultPro = { modelName: 'gemini-3.1-pro', provider: 'google', temperature: 0.7 };
    const defaultFlash = { modelName: 'gemini-3.5-flash', provider: 'google', temperature: 0.2 };

    const registeredModels = modelRegistry.list().map(id => modelRegistry.get(id)!);

    if (registeredModels.length > 0) {
        console.log(`[CostOptimizer] Checking ${registeredModels.length} registered models`);

        // Filter models by reasoning depth and vision
        const candidates = registeredModels.filter(m => {
            if (!m || !m.modelName) return true; // Keep partial configs if they exist but are incomplete
            if (requirements.visionRequired && !m.modelName.includes('vision') && !m.modelName.includes('flash')) return false;
            if (requirements.reasoningDepth === 'high' && m.modelName.includes('flash')) return false;
            return true;
        });

        if (candidates.length > 0) {
            // Pick the "cheapest" (flash preferred if not high reasoning)
            const flash = candidates.find(m => m && m.modelName && m.modelName.includes('flash'));
            if (requirements.reasoningDepth !== 'high' && flash) return flash;
            return candidates[0]!;
        }
    }

    // Fallback logic if registry is empty
    if (requirements.visionRequired) return defaultFlash;
    if (requirements.reasoningDepth === 'high') return defaultPro;
    return defaultFlash;
  }
}

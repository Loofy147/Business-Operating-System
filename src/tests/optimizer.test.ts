import { CostOptimizer } from '../optimization/cost-optimizer';
import { ModelConfig } from '../types';

describe('CostOptimizer', () => {
  it('should prefer flash models', () => {
    const options: ModelConfig[] = [
      { modelName: 'gemini-3.1-pro', provider: 'google' },
      { modelName: 'gemini-3.5-flash', provider: 'google' }
    ];
    const best = CostOptimizer.optimizeModelSelection(options);
    expect(best.modelName).toBe('gemini-3.5-flash');
  });
});

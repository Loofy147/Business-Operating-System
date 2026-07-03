import { CostOptimizer } from '../optimization/cost-optimizer';
import { ModelConfig } from '../types';

describe('CostOptimizer', () => {
  it('should prefer flash models', () => {
    const options: ModelConfig[] = [
      { modelName: 'gemini-pro', provider: 'google' },
      { modelName: 'gemini-flash', provider: 'google' }
    ];
    const best = CostOptimizer.optimizeModelSelection(options);
    expect(best.modelName).toBe('gemini-flash');
  });
});

import { CostOptimizer } from '../optimization/cost-optimizer';
import { ModelRequirements } from '../types';

describe('CostOptimizer', () => {
  let optimizer: CostOptimizer;

  beforeEach(() => {
    optimizer = new CostOptimizer();
  });

  it('should select gemini-3.1-pro for high reasoning requirements', () => {
    const reqs: ModelRequirements = {
      reasoningDepth: 'high',
      visionRequired: false,
      minContextWindow: 8000,
      priority: 'cost'
    };
    const best = optimizer.optimize(reqs);
    expect(best.modelName).toBe('gemini-3.1-pro');
  });

  it('should select flash for vision requirements', () => {
    const reqs: ModelRequirements = {
      reasoningDepth: 'low',
      visionRequired: true,
      minContextWindow: 8000,
      priority: 'cost'
    };
    const best = optimizer.optimize(reqs);
    expect(best.modelName).toBe('gemini-3.5-flash');
  });
});

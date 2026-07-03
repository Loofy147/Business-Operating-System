import { ModelRouter } from './model-router';
import { Task } from '../types';

describe('ModelRouter', () => {
  let router: ModelRouter;

  beforeEach(() => {
    router = new ModelRouter();
  });

  it('should require high reasoning depth for complex tasks', () => {
    const task: Task = {
      id: 't1',
      description: 'Perform complex reasoning about the future of AI in the enterprise.',
      status: 'pending',
      dependencies: []
    };
    const reqs = router.selectRequirements(task);
    expect(reqs.reasoningDepth).toBe('high');
  });

  it('should require vision for vision tasks', () => {
    const task: Task = {
      id: 't2',
      description: 'Describe this image vision task',
      status: 'pending',
      dependencies: []
    };
    const reqs = router.selectRequirements(task);
    expect(reqs.visionRequired).toBe(true);
  });
});

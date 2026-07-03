import { ModelRouter } from './model-router';
import { Task } from '../types';

describe('ModelRouter', () => {
  it('should route complex tasks to gemini-1.5-pro', () => {
    const task: Task = {
      id: 't1',
      description: 'Perform complex reasoning about the future of AI in the enterprise.',
      status: 'pending',
      dependencies: []
    };
    const config = ModelRouter.selectModel(task);
    expect(config.modelName).toBe('gemini-1.5-pro');
  });

  it('should route simple tasks to gemini-1.5-flash', () => {
    const task: Task = {
      id: 't2',
      description: 'Hello',
      status: 'pending',
      dependencies: []
    };
    const config = ModelRouter.selectModel(task);
    expect(config.modelName).toBe('gemini-1.5-flash');
  });
});

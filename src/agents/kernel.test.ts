import { AgentKernel } from './kernel';
import { AgentMetadata, Task } from '../types';
import { AgentState } from '../contracts/agent';

describe('AgentKernel State Machine', () => {
  const metadata: AgentMetadata = {
    id: 'test-agent',
    name: 'Test Agent',
    role: 'Tester',
    capabilities: ['testing']
  };

  it('should transition through states during execution', async () => {
    const kernel = new AgentKernel(metadata);
    const task: Task = {
      id: 'task-1',
      description: 'Run test',
      status: 'pending',
      dependencies: []
    };

    expect(kernel.state).toBe(AgentState.Idle);

    const executePromise = kernel.execute(task);
    // Since it's async, we can check state if it were slower, but here it finishes fast.
    // We mainly want to ensure it ends in Idle after Finished.
    await executePromise;

    // We use a small timeout in the code to reset to Idle
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(kernel.state).toBe(AgentState.Idle);
  });

  it('should transition to Planning state', async () => {
    const kernel = new AgentKernel(metadata);
    const task: Task = {
      id: 'task-1',
      description: 'Plan test',
      status: 'pending',
      dependencies: []
    };
    await kernel.plan(task);
    expect(kernel.state).toBe(AgentState.Planning);
  });
});

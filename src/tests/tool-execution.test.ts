import { AgentKernel } from '../agents/kernel';
import { Task } from '../types';
import { toolRegistry } from '../registry/capability-registry';

describe('Agent Tool Execution', () => {
  it('should identify and execute a registered tool based on task description', async () => {
    const agent = new AgentKernel({
      id: 'a1',
      name: 'Tool Agent',
      role: 'Executor',
      capabilities: ['slack-send']
    });

    const task: Task = {
      id: 't1',
      description: 'Send a slack message to the team',
      status: 'pending',
      dependencies: []
    };

    const result = await agent.execute(task);
    expect(result.success).toBe(true);
    expect(result.output).toContain('Tool slack-send executed successfully');
  });

  it('should fall back to reasoning if no tool is identified', async () => {
    const agent = new AgentKernel({
        id: 'a2',
        name: 'Reasoning Agent',
        role: 'Thinker',
        capabilities: []
      });

      const task: Task = {
        id: 't2',
        description: 'Think about the future of AI',
        status: 'pending',
        dependencies: []
      };

      const result = await agent.execute(task);
      expect(result.success).toBe(true);
      expect(result.output).toContain('Task completed successfully: Standard reasoning');
  });
});

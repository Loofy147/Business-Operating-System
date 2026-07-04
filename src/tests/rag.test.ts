import { AgentKernel } from '../agents/kernel';
import { IKnowledgeSource } from '../contracts/knowledge';

describe('RAG (Retrieval-Augmented Reasoning)', () => {
  it('should augment reasoning context with retrieved knowledge', async () => {
    const mockKnowledgeSource: IKnowledgeSource = {
        query: jest.fn().mockResolvedValue('Retrieved info about task')
    };

    const agent = new AgentKernel({
      id: 'a1',
      name: 'RAG Agent',
      role: 'Researcher',
      capabilities: ['research']
    }, { knowledgeSource: mockKnowledgeSource });

    const task: any = {
        id: 't1',
        description: 'Find info about X',
        status: 'pending',
        dependencies: []
    };

    // Spy on reasoner if we had one, but we check AgentKernel.reason directly
    const reasoning = await agent.reason(task);

    expect(mockKnowledgeSource.query).toHaveBeenCalledWith('Find info about X');
    expect(reasoning).toBeDefined();
  });
});

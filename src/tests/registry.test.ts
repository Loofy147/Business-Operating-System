import { agentRegistry, toolRegistry } from '../registry/capability-registry';

describe('CapabilityRegistry', () => {
  it('should register and retrieve items', () => {
    const mockAgent = { id: 'a1', name: 'Agent 1' };
    agentRegistry.register('a1', mockAgent);
    expect(agentRegistry.get('a1')).toBe(mockAgent);
    expect(agentRegistry.list()).toContain('a1');
  });

  it('should check for existence', () => {
    toolRegistry.register('t1', { name: 'Tool 1' });
    expect(toolRegistry.has('t1')).toBe(true);
    expect(toolRegistry.has('t2')).toBe(false);
  });
});

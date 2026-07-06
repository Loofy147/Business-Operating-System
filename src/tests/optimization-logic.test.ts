import { SemanticCache } from '../optimization/cache-optimizer';
import { CapabilityRegistry } from '../registry/capability-registry';

describe('Optimization Logic', () => {
    describe('SemanticCache (LRU/TTL)', () => {
        it('should evict oldest entry when maxSize is reached (LRU)', () => {
            const cache = new SemanticCache(2, 10000);
            cache.set('q1', 'r1');
            cache.set('q2', 'r2');

            // Access q1 to make it "recent"
            cache.get('q1');

            // This should evict q2
            cache.set('q3', 'r3');

            expect(cache.get('q1')).toBe('r1');
            expect(cache.get('q2')).toBeUndefined();
            expect(cache.get('q3')).toBe('r3');
        });

        it('should expire entries after TTL', async () => {
            const cache = new SemanticCache(10, 50); // 50ms TTL
            cache.set('q1', 'r1');

            expect(cache.get('q1')).toBe('r1');

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(cache.get('q1')).toBeUndefined();
        });
    });

    describe('CapabilityRegistry Indexing', () => {
        it('should index items with capabilities and allow fast lookup', () => {
            const registry = new CapabilityRegistry<any>();
            const agent1 = {
                metadata: { id: 'a1', capabilities: ['Slack', 'Notification'] }
            };
            const agent2 = {
                metadata: { id: 'a2', capabilities: ['GitHub', 'Code'] }
            };

            registry.register('a1', agent1);
            registry.register('a2', agent2);

            const slackAgents = registry.findByCapability('slack');
            const codeAgents = registry.findByCapability('code');
            const unknownAgents = registry.findByCapability('finance');

            expect(slackAgents).toHaveLength(1);
            expect(slackAgents[0].metadata.id).toBe('a1');
            expect(codeAgents).toHaveLength(1);
            expect(codeAgents[0].metadata.id).toBe('a2');
            expect(unknownAgents).toHaveLength(0);
        });
    });
});

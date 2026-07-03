import { VectorStore } from '../knowledge/vector-store';
import { KnowledgeGraph } from '../knowledge/knowledge-graph';

describe('Knowledge Layer', () => {
  describe('VectorStore', () => {
    it('should search by cosine similarity', async () => {
      const vs = new VectorStore();
      await vs.add('1', [1, 0, 0], { name: 'exact' });
      await vs.add('2', [0.8, 0.2, 0], { name: 'close' });
      await vs.add('3', [0, 1, 0], { name: 'far' });

      const results = await vs.search([1, 0, 0], 2);
      expect(results[0].name).toBe('exact');
      expect(results[1].name).toBe('close');
    });
  });

  describe('KnowledgeGraph', () => {
    it('should query relations', () => {
      const kg = new KnowledgeGraph();
      kg.addNode('n1', { name: 'Node 1' });
      kg.addNode('n2', { name: 'Node 2' });
      kg.addEdge('n1', 'n2', 'connects_to');

      const results = kg.query('n1', 'connects_to');
      expect(results.length).toBe(1);
      expect(results[0].target.name).toBe('Node 2');
    });

    it('should find paths between nodes', () => {
      const kg = new KnowledgeGraph();
      kg.addEdge('a', 'b', 'link');
      kg.addEdge('b', 'c', 'link');
      kg.addEdge('c', 'd', 'link');
      kg.addEdge('a', 'x', 'link');

      const paths = kg.findPath('a', 'd', 3);
      expect(paths).toContainEqual(['a', 'b', 'c', 'd']);
    });
  });
});

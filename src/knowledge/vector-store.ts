import { IVectorStore } from '../contracts/knowledge';

export class VectorStore implements IVectorStore {
  private store: Map<string, { vector: number[], metadata: any }> = new Map();

  public async add(id: string, vector: number[], metadata: any): Promise<void> {
    this.store.set(id, { vector, metadata });
  }

  public async search(vector: number[], limit: number): Promise<any[]> {
    const results = Array.from(this.store.values())
      .map(entry => ({
        ...entry,
        score: this.cosineSimilarity(vector, entry.vector)
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return results.map(r => r.metadata);
  }

  public async query(query: string): Promise<any[]> {
      console.log(`[VectorStore] Performing semantic search for: ${query}`);
      // Mock vector generation (1536 dims) and search with a generic vector
      return await this.search(new Array(1536).fill(0.1), 3);
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.max(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
        const a = vecA[i] || 0;
        const b = vecB[i] || 0;
        dotProduct += a * b;
        normA += a * a;
        normB += b * b;
    }
    const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}

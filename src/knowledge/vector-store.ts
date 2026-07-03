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

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += (vecA[i] || 0) * (vecB[i] || 0);
        normA += (vecA[i] || 0) * (vecA[i] || 0);
        normB += (vecB[i] || 0) * (vecB[i] || 0);
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }
}

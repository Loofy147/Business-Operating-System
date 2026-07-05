import { IVectorStore } from '../contracts/knowledge';

export class VectorStore implements IVectorStore {
  private store: Map<string, { vector: number[], metadata: any }> = new Map();

  public async add(id: string, vector: number[], metadata: any): Promise<void> {
    // Optimization: Pre-normalize vectors on addition to speed up search
    const normalizedVector = this.normalize(vector);
    this.store.set(id, { vector: normalizedVector, metadata });
  }

  public async search(vector: number[], limit: number): Promise<any[]> {
    // Optimization: Normalize query vector once per search
    const normalizedQuery = this.normalize(vector);
    const storeValues = Array.from(this.store.values());
    const len = normalizedQuery.length;

    const results = [];
    for (let i = 0; i < storeValues.length; i++) {
        const entry = storeValues[i]!;
        const entryVector = entry.vector;
        let score = 0;
        for (let j = 0; j < len; j++) {
            score += normalizedQuery[j]! * entryVector[j]!;
        }
        results.push({ metadata: entry.metadata, score });
    }

    results.sort((a, b) => b.score - a.score);

    return results.slice(0, limit).map(r => r.metadata);
  }

  public async query(query: string): Promise<any[]> {
      console.log(`[VectorStore] Performing semantic search for: ${query}`);
      // Mock vector generation (1536 dims) and search with a generic vector
      return await this.search(new Array(1536).fill(0.1), 3);
  }

  private normalize(vector: number[]): number[] {
    let sum = 0;
    for (let i = 0; i < vector.length; i++) {
        sum += vector[i]! * vector[i]!;
    }
    const norm = Math.sqrt(sum);
    if (norm === 0) return vector;
    const result = new Array(vector.length);
    for (let i = 0; i < vector.length; i++) {
        result[i] = vector[i]! / norm;
    }
    return result;
  }
}

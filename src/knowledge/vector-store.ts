import { IVectorStore } from '../contracts/knowledge';

export class VectorStore implements IVectorStore {
  private store: Map<string, { vector: number[], metadata: any }> = new Map();

  public async add(id: string, vector: number[], metadata: any): Promise<void> {
    this.store.set(id, { vector, metadata });
  }

  public async search(vector: number[], limit: number): Promise<any[]> {
    // Mock cosine similarity search
    return Array.from(this.store.values()).slice(0, limit);
  }
}

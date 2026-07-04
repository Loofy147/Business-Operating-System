export interface IKnowledgeSource {
  query(query: string): Promise<any>;
}

export interface IVectorStore extends IKnowledgeSource {
  add(id: string, vector: number[], metadata: any): Promise<void>;
  search(vector: number[], limit: number): Promise<any[]>;
}

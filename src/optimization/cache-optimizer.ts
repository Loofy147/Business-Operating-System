export class SemanticCache {
  private cache: Map<string, any> = new Map();

  public get(query: string): any | undefined {
    console.log(`[SemanticCache] Checking cache for: ${query}`);
    return this.cache.get(query);
  }

  public set(query: string, result: any): void {
    console.log(`[SemanticCache] Caching result for: ${query}`);
    this.cache.set(query, result);
  }
}

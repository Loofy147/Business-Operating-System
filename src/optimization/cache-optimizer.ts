interface CacheEntry {
  value: any;
  timestamp: number;
  lastAccessed: number;
}

export class SemanticCache {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly maxSize: number;
  private readonly ttl: number;

  constructor(maxSize: number = 100, ttl: number = 3600000) { // Default 1 hour TTL
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  public get(query: string): any | undefined {
    const entry = this.cache.get(query);
    if (!entry) return undefined;

    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      console.log(`[SemanticCache] Entry expired for: ${query}`);
      this.cache.delete(query);
      return undefined;
    }

    // Update recency (LRU)
    entry.lastAccessed = now;
    console.log(`[SemanticCache] Cache hit for: ${query}`);
    return entry.value;
  }

  public set(query: string, result: any): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    const now = Date.now();
    this.cache.set(query, {
      value: result,
      timestamp: now,
      lastAccessed: now
    });
    console.log(`[SemanticCache] Cached result for: ${query}`);
  }

  private evictLRU(): void {
    let oldestKey: string | undefined;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      console.log(`[SemanticCache] Evicting LRU entry: ${oldestKey}`);
      this.cache.delete(oldestKey);
    }
  }

  public clear(): void {
    this.cache.clear();
  }
}

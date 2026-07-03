import { LongTermMemory } from './long-term-memory';

export interface MemoryEntry {
  id: string;
  content: any;
  timestamp: number;
  importance?: number; // 1-10
  accessCount: number;
}

export class ShortTermMemory {
  private entries: Map<string, MemoryEntry> = new Map();
  private readonly limit: number = 100;
  private readonly importanceThreshold: number = 8;
  private readonly accessThreshold: number = 5;

  constructor(private longTermMemory?: LongTermMemory) {}

  public add(id: string, content: any, importance: number = 1): void {
    if (this.entries.has(id)) {
      this.entries.delete(id);
    } else if (this.entries.size >= this.limit) {
      this.evictLRU();
    }

    this.entries.set(id, {
      id,
      content,
      timestamp: Date.now(),
      importance,
      accessCount: 0
    });

    this.checkPromotion(id);
  }

  public get(id: string): any | null {
    const entry = this.entries.get(id);
    if (entry) {
      entry.accessCount++;
      entry.timestamp = Date.now();

      // Move to end of Map for LRU
      this.entries.delete(id);
      this.entries.set(id, entry);

      this.checkPromotion(id);
      return entry.content;
    }
    return null;
  }

  private evictLRU(): void {
    // In a JS Map, the first key is the oldest (inserted first)
    const oldestId = this.entries.keys().next().value;
    if (oldestId) {
      console.log(`[ShortTermMemory] Evicting LRU entry: ${oldestId}`);
      this.entries.delete(oldestId);
    }
  }

  private async checkPromotion(id: string): Promise<void> {
    const entry = this.entries.get(id);
    if (entry && this.longTermMemory) {
      if (entry.importance >= this.importanceThreshold || entry.accessCount >= this.accessThreshold) {
        await this.longTermMemory.store(id, entry.content);
      }
    }
  }

  public getAllEntries(): MemoryEntry[] {
    return Array.from(this.entries.values());
  }
}

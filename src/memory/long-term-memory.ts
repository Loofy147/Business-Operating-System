export class LongTermMemory {
  private archive: Map<string, any> = new Map();

  public async store(key: string, value: any): Promise<void> {
    console.log(`[LongTermMemory] Storing important entry: ${key}`);
    this.archive.set(key, { ...value, archivedAt: Date.now() });
  }

  public async retrieve(key: string): Promise<any> {
    return this.archive.get(key);
  }

  public async listArchivedKeys(): Promise<string[]> {
    return Array.from(this.archive.keys());
  }
}

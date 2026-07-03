export class ShortTermMemory {
  private entries: any[] = [];
  private limit: number = 100;

  public add(entry: any): void {
    this.entries.push({ ...entry, timestamp: Date.now() });
    if (this.entries.length > this.limit) {
      this.entries.shift();
    }
  }

  public getAll(): any[] {
    return this.entries;
  }
}

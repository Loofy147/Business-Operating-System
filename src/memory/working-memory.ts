export class WorkingMemory {
  private state: Map<string, any> = new Map();

  public set(key: string, value: any): void {
    this.state.set(key, value);
  }

  public get(key: string): any {
    return this.state.get(key);
  }

  public listKeys(): string[] {
    return Array.from(this.state.keys());
  }

  public clear(): void {
    console.log('[WorkingMemory] Clearing task-scoped memory');
    this.state.clear();
  }
}

export class WorkingMemory {
  private state: Map<string, any> = new Map();

  public set(key: string, value: any): void {
    this.state.set(key, value);
  }

  public get(key: string): any {
    return this.state.get(key);
  }

  public clear(): void {
    this.state.clear();
  }
}

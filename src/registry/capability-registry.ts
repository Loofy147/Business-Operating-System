export class CapabilityRegistry<T> {
  private items: Map<string, T> = new Map();

  public register(id: string, item: T): void {
    console.log(`[Registry] Registering ${id}`);
    this.items.set(id, item);
  }

  public get(id: string): T | undefined {
    return this.items.get(id);
  }

  public list(): string[] {
    return Array.from(this.items.keys());
  }

  public has(id: string): boolean {
    return this.items.has(id);
  }
}

export const agentRegistry = new CapabilityRegistry<any>();
export const toolRegistry = new CapabilityRegistry<any>();
export const modelRegistry = new CapabilityRegistry<any>();
export const pluginRegistry = new CapabilityRegistry<any>();

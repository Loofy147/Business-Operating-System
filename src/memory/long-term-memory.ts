export class LongTermMemory {
  // Mock for persistence
  public async store(key: string, value: any): Promise<void> {
    console.log(`Storing ${key} in long-term memory`);
  }

  public async retrieve(key: string): Promise<any> {
    return null;
  }
}

export interface PriorityItem<T> {
  item: T;
  priority: number;
}

export class PriorityQueue<T> {
  private queue: PriorityItem<T>[] = [];

  public push(item: T, priority: number): void {
    this.queue.push({ item, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
  }

  public pop(): T | undefined {
    return this.queue.shift()?.item;
  }

  public get length(): number {
    return this.queue.length;
  }
}

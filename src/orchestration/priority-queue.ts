export interface PriorityItem<T> {
  item: T;
  priority: number;
}

export class PriorityQueue<T> {
  private heap: PriorityItem<T>[] = [];

  public push(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }

  public pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    if (this.heap.length === 1) return this.heap.pop()?.item;

    const top = this.heap[0]!.item;
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return top;
  }

  public remove(predicate: (item: T) => boolean): void {
    const originalLength = this.heap.length;
    this.heap = this.heap.filter(pi => !predicate(pi.item));

    if (this.heap.length !== originalLength) {
        // Re-heapify if items were removed. O(N)
        this.heapify();
    }
  }

  public get length(): number {
    return this.heap.length;
  }

  private heapify(): void {
    for (let i = Math.floor(this.heap.length / 2) - 1; i >= 0; i--) {
      this.bubbleDown(i);
    }
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[index]!.priority <= this.heap[parentIndex]!.priority) break;

      [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex]!, this.heap[index]!];
      index = parentIndex;
    }
  }

  private bubbleDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.heap[left]!.priority > this.heap[largest]!.priority) {
        largest = left;
      }
      if (right < length && this.heap[right]!.priority > this.heap[largest]!.priority) {
        largest = right;
      }

      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [this.heap[largest]!, this.heap[index]!];
      index = largest;
    }
  }
}

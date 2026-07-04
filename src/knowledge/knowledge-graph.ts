export class KnowledgeGraph {
  private nodes: Map<string, any> = new Map();
  private edges: Array<{ from: string, to: string, relation: string }> = [];

  public addNode(id: string, data: any): void {
    this.nodes.set(id, data);
  }

  public addEdge(from: string, to: string, relation: string): void {
    this.edges.push({ from, to, relation });
  }

  public query(startNode: string, relation?: string): any[] {
    const matchingEdges = this.edges.filter(e =>
        e.from === startNode && (!relation || e.relation === relation)
    );
    return matchingEdges.map(e => ({
        edge: e,
        target: this.nodes.get(e.to)
    }));
  }

  public findPath(start: string, end: string, maxDepth: number = 3): string[][] {
      const paths: string[][] = [];
      const queue: string[][] = [[start]];

      while (queue.length > 0) {
          const path = queue.shift()!;
          const node = path[path.length - 1]!;

          if (node === end) {
              paths.push(path);
              continue;
          }

          if (path.length <= maxDepth) {
              const neighbors = this.edges.filter(e => e.from === node).map(e => e.to);
              for (const neighbor of neighbors) {
                  if (!path.includes(neighbor)) {
                      queue.push([...path, neighbor]);
                  }
              }
          }
      }
      return paths;
  }
}

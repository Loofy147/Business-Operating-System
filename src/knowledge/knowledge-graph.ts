export class KnowledgeGraph {
  private nodes: Map<string, any> = new Map();
  private edges: Array<{ from: string, to: string, relation: string }> = [];

  public addNode(id: string, data: any): void {
    this.nodes.set(id, data);
  }

  public addEdge(from: string, to: string, relation: string): void {
    this.edges.push({ from, to, relation });
  }

  public query(startNode: string): any[] {
    return this.edges.filter(e => e.from === startNode);
  }
}

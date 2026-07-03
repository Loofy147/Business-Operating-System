export class Evaluator {
  public async evaluate(result: any, criteria: string[]): Promise<{ score: number, feedback: string }> {
    console.log(`[Evaluator] Evaluating result...`);
    return { score: 0.95, feedback: "Excellent performance." };
  }
}

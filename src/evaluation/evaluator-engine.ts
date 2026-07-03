export interface EvaluationResult {
  accuracy: number;
  safety: number;
  reasoning_quality: number;
  latency: number;
  cost: number;
  feedback?: string;
}

export class EvaluatorEngine {
  public static evaluate(output: any, criteria: string[]): EvaluationResult {
    console.log('[EvaluatorEngine] Running automated evaluation against criteria:', criteria);

    // Improved mock logic
    let accuracy = 0.85;
    let safety = 1.0;
    let reasoning_quality = 0.8;

    if (typeof output === 'string') {
        if (output.toLowerCase().includes('success')) accuracy += 0.1;
        if (output.toLowerCase().includes('fail')) accuracy -= 0.3;
        if (output.toLowerCase().includes('sensitive')) safety -= 0.5;
    }

    return {
      accuracy: Math.min(1.0, Math.max(0, accuracy)),
      safety: Math.min(1.0, Math.max(0, safety)),
      reasoning_quality: Math.min(1.0, Math.max(0, reasoning_quality)),
      latency: 150,
      cost: 0.001,
      feedback: accuracy > 0.8 ? "Task performed well." : "Task needs improvement."
    };
  }
}

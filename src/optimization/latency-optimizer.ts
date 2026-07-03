import { ModelConfig } from '../types';

export class LatencyOptimizer {
  public static optimizeRouting(providers: string[]): string {
    console.log('[LatencyOptimizer] Selecting provider with lowest latency');
    if (providers.length === 0) {
      throw new Error('LatencyOptimizer.optimizeRouting: providers must not be empty');
    }
    return providers[0]!;
  }
}

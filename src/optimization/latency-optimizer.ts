import { ModelConfig } from '../types';

export class LatencyOptimizer {
  public static optimizeRouting(providers: string[]): string {
    console.log('[LatencyOptimizer] Selecting provider with lowest latency');
    return providers[0];
  }
}

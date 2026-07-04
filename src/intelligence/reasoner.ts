import { IReasoner } from '../contracts/intelligence';

export class Reasoner implements IReasoner {
  public async reason(input: any): Promise<string> {
    console.log(`[Reasoner] Reasoning about input...`);

    const context = typeof input === 'string' ? input : JSON.stringify(input);
    const lowContext = context.toLowerCase();

    if (lowContext.includes('financial')) {
        return "Analysis indicates significant financial implications requiring strict policy adherence.";
    }
    if (lowContext.includes('bug') || lowContext.includes('error')) {
        return "Root cause analysis suggests a synchronization mismatch in the orchestration layer.";
    }
    if (lowContext.includes('research')) {
        return "Synthesizing retrieved data points reveals a trend towards autonomous multi-agent coordination.";
    }

    return "Standard reasoning completed: The proposed path aligns with system goals.";
  }
}

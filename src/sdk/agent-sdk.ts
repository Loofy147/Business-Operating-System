import { AgentKernel } from '../agents/kernel';
import { AgentMetadata } from '../types';

export class AgentSDK {
  public static createAgent(metadata: AgentMetadata): AgentKernel {
    console.log(`[SDK] Creating new agent: ${metadata.name}`);
    return new AgentKernel(metadata);
  }
}

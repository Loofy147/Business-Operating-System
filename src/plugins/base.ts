import { AgentKernel } from '../agents/kernel';

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
}

export abstract class BasePlugin {
  abstract metadata: PluginMetadata;
  abstract initialize(kernel: AgentKernel): Promise<void>;
}

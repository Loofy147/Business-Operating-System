import { BasePlugin, PluginMetadata } from './base';
import { AgentKernel } from '../agents/kernel';

export class FinancePlugin extends BasePlugin {
  metadata: PluginMetadata = {
    name: 'Finance Plugin',
    version: '1.0.0',
    description: 'Provides financial analysis and reporting tools.'
  };

  async initialize(kernel: AgentKernel): Promise<void> {
    console.log(`Initializing ${this.metadata.name} for agent ${kernel.metadata.name}`);

    kernel.registerTool('analyzeExpenses', (expenses: any[]) => {
      return expenses.reduce((sum, e) => sum + e.amount, 0);
    });

    kernel.addPolicy('Only allow expense analysis for approved categories.');
  }
}

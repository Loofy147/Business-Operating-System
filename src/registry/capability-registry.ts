export class CapabilityRegistry<T> {
  private items: Map<string, T> = new Map();
  private index: Map<string, Set<string>> = new Map();

  public register(id: string, item: T): void {
    console.log(`[Registry] Registering ${id}`);
    this.items.set(id, item);

    // Dynamic indexing if item has metadata with capabilities
    const anyItem = item as any;
    if (anyItem.metadata && Array.isArray(anyItem.metadata.capabilities)) {
        for (const cap of anyItem.metadata.capabilities) {
            const normalizedCap = cap.toLowerCase();
            if (!this.index.has(normalizedCap)) {
                this.index.set(normalizedCap, new Set());
            }
            this.index.get(normalizedCap)!.add(id);
        }
    }
  }

  public get(id: string): T | undefined {
    return this.items.get(id);
  }

  public findByCapability(capability: string): T[] {
      const normalizedCap = capability.toLowerCase();
      const ids = this.index.get(normalizedCap);
      if (!ids) return [];

      const results: T[] = [];
      for (const id of ids) {
          const item = this.get(id);
          if (item) results.push(item);
      }
      return results;
  }

  public list(): string[] {
    return Array.from(this.items.keys());
  }

  public has(id: string): boolean {
    return this.items.has(id);
  }
}

// Strictly typed registries to avoid 'any'
import { IAgent } from '../contracts/agent';
import { ITool } from '../contracts/tool';
import { ModelConfig } from '../types';
import { IPlugin } from '../contracts/plugin';
import { SlackConnector } from '../connectors/slack-connector';
import { GitHubConnector } from '../connectors/github-connector';

export const agentRegistry = new CapabilityRegistry<IAgent>();
export const toolRegistry = new CapabilityRegistry<ITool>();
export const modelRegistry = new CapabilityRegistry<ModelConfig>();
export const pluginRegistry = new CapabilityRegistry<IPlugin>();

// Wrapper to adapt connectors to ITool
class ConnectorTool implements ITool {
    constructor(
        public name: string,
        public description: string,
        public parameters: any,
        private connectorFn: Function
    ) {}
    async execute(args: any): Promise<any> {
        return await this.connectorFn(args);
    }
}

const slack = new SlackConnector();
const github = new GitHubConnector();

toolRegistry.register('slack-send', new ConnectorTool(
    'slack-send',
    'Send a message to a Slack channel',
    { channel: 'string', text: 'string' },
    (args: any) => slack.sendMessage(args.channel, args.text)
));

toolRegistry.register('github-issue', new ConnectorTool(
    'github-issue',
    'Create a GitHub issue',
    { owner: 'string', repo: 'string', title: 'string' },
    (args: any) => github.createIssue(args.owner, args.repo, args.title)
));

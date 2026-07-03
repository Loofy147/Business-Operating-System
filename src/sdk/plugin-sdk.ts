import { IPlugin } from '../contracts/plugin';
import { IAgent } from '../contracts/agent';

export abstract class BasePlugin implements IPlugin {
  abstract name: string;
  abstract version: string;
  abstract description: string;
  abstract initialize(agent: IAgent): Promise<void>;

  protected log(message: string): void {
    console.log(`[Plugin:${this.name}] ${message}`);
  }
}

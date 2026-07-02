import { IAgent } from './agent';

export interface IPlugin {
  name: string;
  version: string;
  initialize(agent: IAgent): Promise<void>;
}

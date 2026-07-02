import { IReasoner } from '../contracts/intelligence';

export class Reasoner implements IReasoner {
  public async reason(input: any): Promise<string> {
    console.log(`[Reasoner] Reasoning about input...`);
    return "The reasoning result is positive.";
  }
}

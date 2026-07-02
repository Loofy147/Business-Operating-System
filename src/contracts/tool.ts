export interface ITool {
  name: string;
  description: string;
  parameters: any;
  execute(args: any): Promise<any>;
}

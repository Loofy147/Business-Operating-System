import { AgentId, Goal, AgentMetadata, ExecutionResult, Task, ModelConfig } from '../types';
import { IAgent, AgentState } from '../contracts/agent';
import { IPlanner, IReasoner, IModelRouter } from '../contracts/intelligence';
import { IModelOptimizer } from '../contracts/optimization';
import { ShortTermMemory } from '../memory/short-term-memory';
import { IEventBus } from '../contracts/event';
import { EventType } from '../types/events';

export class AgentKernel implements IAgent {
  public metadata: AgentMetadata;
  public state: AgentState = AgentState.Idle;
  protected goals: Goal[] = [];
  protected memory: ShortTermMemory = new ShortTermMemory();
  protected tools: Map<string, Function> = new Map();
  protected policies: string[] = [];
  protected totalCost: number = 0;

  private planner: IPlanner | undefined;
  private reasoner: IReasoner | undefined;
  private eventBus: IEventBus | undefined;
  private modelRouter: IModelRouter | undefined;
  private modelOptimizer: IModelOptimizer | undefined;

  constructor(metadata: AgentMetadata, components?: {
    planner?: IPlanner,
    reasoner?: IReasoner,
    eventBus?: IEventBus,
    modelRouter?: IModelRouter,
    modelOptimizer?: IModelOptimizer
  }) {
    this.metadata = metadata;
    this.planner = components?.planner;
    this.reasoner = components?.reasoner;
    this.eventBus = components?.eventBus;
    this.modelRouter = components?.modelRouter;
    this.modelOptimizer = components?.modelOptimizer;
  }

  public addGoal(goal: Goal): void {
    this.goals.push(goal);
  }

  public getGoals(): Goal[] {
    return this.goals;
  }

  public registerTool(name: string, fn: Function): void {
    this.tools.set(name, fn);
  }

  public addPolicy(policy: string): void {
    this.policies.push(policy);
  }

  public getPolicies(): string[] {
    return this.policies;
  }

  protected setState(newState: AgentState): void {
    console.log(`[${this.metadata.name}] Transitioning from ${this.state} to ${newState}`);
    this.state = newState;
  }

  private publishEvent(type: EventType, payload: any): void {
    if (this.eventBus) {
      this.eventBus.publish({
        id: Math.random().toString(),
        type,
        timestamp: Date.now(),
        trace_id: 'agent-internal',
        agent_id: this.metadata.id,
        payload,
        metadata: {}
      });
    }
  }

  async plan(task: Task): Promise<Task[]> {
    this.setState(AgentState.Planning);
    if (this.planner) {
      return await this.planner.createPlan(task);
    }
    return [];
  }

  async reason(context: any): Promise<string> {
    this.setState(AgentState.Reasoning);
    this.publishEvent(EventType.ReasoningStarted, { context });
    const result = this.reasoner ? await this.reasoner.reason(context) : "Standard reasoning";
    this.publishEvent(EventType.ReasoningCompleted, { result });
    return result;
  }

  protected selectModel(task: Task): ModelConfig | undefined {
    if (this.modelRouter && this.modelOptimizer) {
      const requirements = this.modelRouter.selectRequirements(task, {});
      const config = this.modelOptimizer.optimize(requirements);
      console.log(`[${this.metadata.name}] Selected model ${config.modelName} via arbitration`);
      return config;
    }
    return undefined;
  }

  async execute(task: Task): Promise<ExecutionResult> {
    this.selectModel(task);

    let attempts = 0;
    const maxAttempts = 3;
    let result: ExecutionResult;

    do {
      attempts++;
      this.setState(AgentState.ToolSelection);
      this.setState(AgentState.Execution);

      const startTime = Date.now();
      // Placeholder for actual execution logic
      const success = Math.random() > 0.2; // Simulating intermittent failure
      const output = success ? "Task completed successfully" : "Task failed";

      this.setState(AgentState.Validation);
      result = {
        success,
        output,
        metrics: {
          latency: Date.now() - startTime,
          tokens: 0,
          cost: 0
        }
      };

      if (!result.success) {
        if (attempts < maxAttempts) {
          console.log(`[${this.metadata.name}] Execution failed, retrying (attempt ${attempts}/${maxAttempts})`);
          this.setState(AgentState.Retrying);
          // Potential back-off or strategy refinement here
          await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for retry
        } else {
          console.log(`[${this.metadata.name}] Execution failed after max attempts, refining strategy`);
          this.setState(AgentState.Refining);
          // In a real scenario, this might loop back to planning
          await this.plan(task); // Re-plan if everything else fails
        }
      }
    } while (!result.success && attempts < maxAttempts);

    await this.reflect(result);
    await this.updateMemory(result);

    this.setState(AgentState.Finished);
    setTimeout(() => this.setState(AgentState.Idle), 0);

    return result;
  }

  async reflect(result: ExecutionResult): Promise<void> {
    this.setState(AgentState.Reflection);
    console.log(`[${this.metadata.name}] Reflecting on result: ${result.success}`);
  }

  protected async updateMemory(result: ExecutionResult): Promise<void> {
    this.setState(AgentState.MemoryUpdate);
    this.memory.add({ result });
    this.publishEvent(EventType.MemoryWrite, { result });
  }
}

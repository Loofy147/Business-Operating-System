import { AgentId, Goal, AgentMetadata, ExecutionResult, Task, ModelConfig, PolicyValidationResult } from '../types';
import { IAgent, AgentState } from '../contracts/agent';
import { IPlanner, IReasoner, IModelRouter } from '../contracts/intelligence';
import { IModelOptimizer } from '../contracts/optimization';
import { IPolicyEngine } from '../contracts/governance';
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
  private policyEngine: IPolicyEngine | undefined;

  constructor(metadata: AgentMetadata, components?: {
    planner?: IPlanner,
    reasoner?: IReasoner,
    eventBus?: IEventBus,
    modelRouter?: IModelRouter,
    modelOptimizer?: IModelOptimizer,
    policyEngine?: IPolicyEngine
  }) {
    this.metadata = metadata;
    this.planner = components?.planner;
    this.reasoner = components?.reasoner;
    this.eventBus = components?.eventBus;
    this.modelRouter = components?.modelRouter;
    this.modelOptimizer = components?.modelOptimizer;
    this.policyEngine = components?.policyEngine;
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
    // Gate 1: Request Validation
    if (this.policyEngine) {
      const validation = this.policyEngine.validateRequest(task);
      if (!validation.allowed) {
        throw new Error(`Task rejected by Policy Engine: ${validation.reason}`);
      }
      if (validation.requiresHITL) {
        console.log(`[${this.metadata.name}] Task requires HITL approval: ${validation.reason}`);
        // Placeholder for HITL wait logic
      }
    }

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
    let result: ExecutionResult = { success: false, output: null, metrics: { latency: 0, tokens: 0, cost: 0 } };

    do {
      attempts++;
      this.setState(AgentState.ToolSelection);

      // Gate 2: Pre-execution Check
      if (this.policyEngine) {
        const validation = this.policyEngine.preExecutionCheck(task, {});
        if (!validation.allowed) {
          result = {
            success: false,
            output: null,
            error: `Pre-execution check failed: ${validation.reason}`,
            metrics: { latency: 0, tokens: 0, cost: 0 }
          };
          break;
        }
      }

      this.setState(AgentState.Execution);
      const startTime = Date.now();

      // Placeholder for actual execution logic
      const success = Math.random() > 0.2;
      // Allow passing output via task for testing purposes
      const output = (task as any).testOutput || (success ? "Task completed successfully" : "Task failed");

      result = {
        success,
        output,
        metrics: {
          latency: Date.now() - startTime,
          tokens: 0,
          cost: 0
        }
      };

      // Gate 3: Post-execution Safety Check
      if (this.policyEngine && result.success) {
        const validation = this.policyEngine.postExecutionCheck(result, {});
        if (!validation.allowed) {
          console.log(`[${this.metadata.name}] Post-execution safety check failed: ${validation.reason}`);
          result = {
            success: false,
            output: null,
            error: validation.reason,
            metrics: result.metrics
          };
        }
      }

      this.setState(AgentState.Validation);

      if (!result.success) {
        if (attempts < maxAttempts) {
          console.log(`[${this.metadata.name}] Execution failed, retrying (attempt ${attempts}/${maxAttempts})`);
          this.setState(AgentState.Retrying);
          await new Promise(resolve => setTimeout(resolve, 100));
        } else {
          console.log(`[${this.metadata.name}] Execution failed after max attempts, refining strategy`);
          this.setState(AgentState.Refining);
          await this.plan(task);
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

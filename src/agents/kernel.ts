import { DistributedTracing } from "../observation/distributed-tracing";
import { globalMetrics } from "../observation/metrics-collector";
import { EvaluatorEngine } from "../evaluation/evaluator-engine";
import { AgentId, Goal, AgentMetadata, ExecutionResult, Task, ModelConfig, PolicyValidationResult } from '../types';
import { IAgent, AgentState } from '../contracts/agent';
import { IPlanner, IReasoner, IModelRouter } from '../contracts/intelligence';
import { IModelOptimizer } from '../contracts/optimization';
import { IPolicyEngine } from '../contracts/governance';
import { IKnowledgeSource } from '../contracts/knowledge';
import { ShortTermMemory } from '../memory/short-term-memory';
import { WorkingMemory } from '../memory/working-memory';
import { LongTermMemory } from '../memory/long-term-memory';
import { IEventBus } from '../contracts/event';
import { EventType } from '../types/events';

export class AgentKernel implements IAgent {
  public metadata: AgentMetadata;
  public state: AgentState = AgentState.Idle;
  protected goals: Goal[] = [];
  protected workingMemory: WorkingMemory = new WorkingMemory();
  protected shortTermMemory: ShortTermMemory;
  protected longTermMemory: LongTermMemory = new LongTermMemory();
  protected tools: Map<string, Function> = new Map();
  protected policies: string[] = [];
  protected totalCost: number = 0;

  private planner: IPlanner | undefined;
  private reasoner: IReasoner | undefined;
  private eventBus: IEventBus | undefined;
  private modelRouter: IModelRouter | undefined;
  private modelOptimizer: IModelOptimizer | undefined;
  private policyEngine: IPolicyEngine | undefined;
  private knowledgeSource: IKnowledgeSource | undefined;

  constructor(metadata: AgentMetadata, components?: {
    planner?: IPlanner,
    reasoner?: IReasoner,
    eventBus?: IEventBus,
    modelRouter?: IModelRouter,
    modelOptimizer?: IModelOptimizer,
    policyEngine?: IPolicyEngine,
    knowledgeSource?: IKnowledgeSource
  }) {
    this.metadata = metadata;
    this.planner = components?.planner;
    this.reasoner = components?.reasoner;
    this.eventBus = components?.eventBus;
    this.modelRouter = components?.modelRouter;
    this.modelOptimizer = components?.modelOptimizer;
    this.policyEngine = components?.policyEngine;
    this.knowledgeSource = components?.knowledgeSource;
    this.shortTermMemory = new ShortTermMemory(this.longTermMemory);
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

    let augmentedContext = context;
    if (this.knowledgeSource && typeof context === 'object' && (context as any).description) {
        console.log(`[${this.metadata.name}] Retrieving knowledge for RAG`);
        const knowledge = await this.knowledgeSource.query((context as any).description);
        augmentedContext = { ...context, retrievedKnowledge: knowledge };
    }

    const result = this.reasoner ? await this.reasoner.reason(augmentedContext) : "Standard reasoning";
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
    const traceId = (task as any).trace_id || Math.random().toString(36).substring(7);
    const executeSpan = DistributedTracing.startSpan(traceId, "AgentKernel.execute");

    this.selectModel(task);

    // Task-scoped memory setup
    this.workingMemory.set('taskId', task.id);

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
      const reasoning = await this.reason(task);
      const output = (task as any).testOutput || (success ? `Task completed successfully: ${reasoning}` : "Task failed");

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
      if (result.success) {
        const evalResult = EvaluatorEngine.evaluate(result.output, []);
        console.log(`[${this.metadata.name}] Evaluation Score: ${evalResult.accuracy}`);
        if (evalResult.accuracy < 0.6) {
          console.log(`[${this.metadata.name}] Low accuracy detected, marking as failure for retry`);
          result.success = false;
          result.error = "Low accuracy result";
        }
      }

      if (!result.success) {
        if (attempts < maxAttempts) {
          console.log(`[${this.metadata.name}] Execution failed, retrying (attempt ${attempts}/${maxAttempts})`);
          this.setState(AgentState.Retrying);
          await new Promise(resolve => setTimeout(resolve, 10));
        } else {
          console.log(`[${this.metadata.name}] Execution failed after max attempts, refining strategy`);
          this.setState(AgentState.Refining);
          result.subtasks = await this.plan(task);
        }
      }
    } while (!result.success && attempts < maxAttempts);

    await this.reflect(result);
    await this.updateMemory(result);

    this.setState(AgentState.Finished);

    // Explicit eviction of working memory
    this.workingMemory.clear();

    this.setState(AgentState.Idle);

    globalMetrics.recordMetric("task_execution_latency", result.metrics.latency, {
        agentId: this.metadata.id,
        success: result.success.toString()
    });
    DistributedTracing.endSpan(executeSpan);

    return result;
  }

  async reflect(result: ExecutionResult): Promise<void> {
    this.setState(AgentState.Reflection);
    console.log(`[${this.metadata.name}] Reflecting on result: ${result.success}`);
  }

  protected async updateMemory(result: ExecutionResult): Promise<void> {
    this.setState(AgentState.MemoryUpdate);

    // Add to short-term memory
    this.shortTermMemory.add(
      Math.random().toString(),
      { result, timestamp: Date.now() },
      result.success ? 5 : 2 // Successes are slightly more "important"
    );

    this.publishEvent(EventType.MemoryWrite, { result });
  }
}

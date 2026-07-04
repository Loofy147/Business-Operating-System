# AI Business Operating System (AI-BOS)

An intelligent Business Operating System that coordinates specialized AI agents, enterprise knowledge, business applications, and human teams to autonomously plan, execute, monitor, verify, and continuously improve complex workflows at enterprise scale.

## Architecture

The AI-BOS is built on a multi-layered architecture designed for enterprise-grade intelligence, observability, and governance.

### Layers

1.  **Gateway Layer**: Authentication, Rate Limiting (Session-based), and Traceability.
2.  **Executive Agent**: Lead executive agent for high-level coordination.
3.  **Orchestration Layer**: Event Bus, Agent Engine (with Plugin lifecycle), Workflow Graph, and Task Scheduling.
4.  **Agent Kernel**: Common internal architecture for all specialist agents (Identity, Goals, Multi-tier Memory, Automated Tool Selection).
5.  **Specialist Agents**: Configured instances of the kernel with capability-based routing.
6.  **Tool Layer**: Connectors (Slack, GitHub) adapted as functional ITool instances.
7.  **Memory Layer**: Knowledge Graph, Vector DB, Semantic Cache, and Tiered Session Memory.
8.  **Intelligence Layer**: Model Router (Arbitration) and context-aware Reasoner/Planner.
9.  **Optimization Layer**: Prompt optimization, Cost/Latency optimization, and Provider selection.
10. **Observation Layer**: Logs, Metrics (via Plugin), Traces (End-to-end), and Agent Replay.
11. **Governance Layer**: IAM (RBAC), Policy Engine, and HITL (Human-In-The-Loop) Registry.

## Key Features

- **Agent Kernel**: Unified architecture for all agents including multi-tier memory retrieval, automated tool execution, and self-evaluation.
- **Intelligent Orchestration**: Event-driven engine that routes tasks to agents based on registered capabilities and manages subtask lifecycles.
- **Three-Gate Governance**: Mandatory validation gates: **Request Validation** (Risk scoring), **Pre-execution Check** (IAM/RBAC), and **Post-execution Safety Check** (Data scanning).
- **HITL Integration**: Native support for pausing high-risk tasks for human approval via a dedicated registry.
- **System-Wide Traceability**: Every request is assigned a unique traceId at the gateway, propagated through all orchestration and execution spans.
- **Extensible Plugin System**: Formal lifecycle for adding system-wide capabilities like performance metrics aggregation.
- **Performance Optimization**: Integrated semantic caching and dynamic model selection based on reasoning depth and cost requirements.

## Project Structure

```
src/
├── agents/        # Agent Kernel and specialist agent definitions
├── connectors/    # SaaS connectors (Slack, GitHub)
├── contracts/     # Well-defined TypeScript interfaces (Contract-First)
├── evaluation/    # AI Performance Evaluation
├── gateway/       # API Gateway with Rate Limiting and Traceability
├── governance/    # Policy Engine, HITL Registry, and IAM
├── intelligence/  # Model Router, Planner, Reasoner
├── knowledge/     # Vector DB (Semantic search) and Knowledge Graph
├── memory/        # Tiered memory (Working, Short-term, Long-term)
├── observation/   # Metrics, Logging, and Distributed Tracing
├── optimization/  # Cost/Latency optimization and Semantic Cache
├── orchestration/ # Event Bus, Scheduler, and Agent Engine
├── plugins/       # Extensible plugin system (Metrics implementation)
├── registry/      # Capability Registries (Agents, Tools, Models, Plugins)
├── sdk/           # Extension SDKs for Agents and Plugins
├── types/         # Core TypeScript types and event schemas
└── tests/         # Comprehensive integration and unit tests
```

## Getting Started

### Installation

```bash
npm install
```

### Running Tests

```bash
npm test
```

## Usage Example

```typescript
import { AgentKernel } from './src/agents/kernel';
import { ModelRouter } from './src/intelligence/model-router';
import { CostOptimizer } from './src/optimization/cost-optimizer';
import { PolicyEngine } from './src/governance/policy-engine';

const agent = new AgentKernel({
  id: 'a1',
  name: 'Research Agent',
  role: 'Researcher',
  capabilities: ['web-search', 'analysis']
}, {
  modelRouter: new ModelRouter(),
  modelOptimizer: new CostOptimizer(),
  policyEngine: new PolicyEngine()
});

// Execute tasks with integrated memory, tools, and governance
await agent.execute(task);
```

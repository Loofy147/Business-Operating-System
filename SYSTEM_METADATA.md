# AI-BOS System Metadata & API Signatures

This document provides a comprehensive map of the AI-BOS architecture's contracts, types, and core implementations.

## Core Contracts (Interfaces)

### Agent Layer
- **IAgent**: Core interface for all agents. Defines lifecycle methods (`plan`, `reason`, `execute`, `reflect`).
- **AgentState**: Enum (Idle, Planning, Reasoning, ToolSelection, Execution, Reflection, Validation, MemoryUpdate, Refining, Retrying, Finished).

### Intelligence Layer
- **IPlanner**: Decomposes tasks into subtasks using keyword-aware logic.
- **IReasoner**: Processes inputs to generate context-aware conclusions (Financial, Debugging, Research).
- **IModelRouter**: Selects `ModelRequirements` based on task complexity.

### Orchestration Layer
- **IScheduler**: Manages task queuing and prioritization with cancellation support.
- **IEventBus**: Centralized event distribution (Publish/Subscribe).
- **IWorkflow**: Manages sets of tasks and their dependencies.
- **AgentEngine**: Orchestrates task execution with capability-based agent routing and event-driven watchers (Automatic Remediation, Task Auto-scheduling).

### Governance & Optimization
- **IPolicyEngine**: Implements Three-Gate validation (Request, Pre-execution, Post-execution) with IAM role-based access control.
- **IModelOptimizer**: Selects specific `ModelConfig` from the registry based on requirements.
- **HITLRegistry**: Manages Human-In-The-Loop approval requests and status.
- **IAM**: Identity and Access Management with permission checking (`admin` vs `user` roles).

### Knowledge & Memory
- **IKnowledgeSource**: Interface for querying external knowledge (RAG).
- **IVectorStore**: Semantic search and storage.
- **ITool**: Executable capabilities (Slack, GitHub connectors integrated with automated identification).
- **SemanticCache**: Caches reasoning results to optimize latency and cost.

## Core Data Types

### Task & Execution
- **Task**: `{ id, description, status, assignedTo, dependencies, result }`
- **ExecutionResult**: `{ success, output, error, subtasks, metrics: { latency, tokens, cost } }`

### Governance
- **RiskAssessment**: `{ privacyScore, operationalScore, financialScore, safetyScore }`
- **PolicyValidationResult**: `{ allowed, reason, riskAssessment, requiresHITL }`

### Models
- **ModelRequirements**: `{ reasoningDepth, visionRequired, minContextWindow, priority }`
- **ModelConfig**: `{ modelName, provider, maxTokens, temperature }`

## System Metadata

### Registered Agents
- Standard Kernel: `AgentKernel` (HITL-aware, Cache-integrated, Automated Tool Execution)
- Specialist SDK: `AgentSDK`

### System Capabilities (Registries)
- **AgentRegistry**: Strictly typed `IAgent` registry for dynamic routing.
- **ToolRegistry**: Strictly typed `ITool` registry (SaaS Connectors registered).
- **ModelRegistry**: Strictly typed `ModelConfig` registry for cost/performance optimization.
- **PluginRegistry**: Tracks extensible system additions.

### Gateway Features
- **Authentication**: Token-based session management.
- **Rate Limiting**: Session-based request frequency control (max 5 req/min).

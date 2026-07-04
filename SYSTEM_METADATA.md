# AI-BOS System Metadata & API Signatures

This document provides a comprehensive map of the AI-BOS architecture's contracts, types, and core implementations.

## Core Contracts (Interfaces)

### Agent Layer
- **IAgent**: Core interface for all agents. Defines lifecycle methods (`plan`, `reason`, `execute`, `reflect`).
- **AgentState**: Enum (Idle, Planning, Reasoning, ToolSelection, Execution, Reflection, Validation, MemoryUpdate, Refining, Retrying, Finished).

### Intelligence Layer
- **IPlanner**: Decomposes tasks into subtasks.
- **IReasoner**: Processes inputs to generate logical conclusions.
- **IModelRouter**: Selects `ModelRequirements` based on task complexity.

### Orchestration Layer
- **IScheduler**: Manages task queuing and prioritization.
- **IEventBus**: Centralized event distribution (Publish/Subscribe).
- **IWorkflow**: Manages sets of tasks and their dependencies.

### Governance & Optimization
- **IPolicyEngine**: Implements Three-Gate validation (Request, Pre-execution, Post-execution).
- **IModelOptimizer**: Selects specific `ModelConfig` based on requirements.
- **IOptimizer**: Generic optimization interface.

### Knowledge & Memory
- **IKnowledgeSource**: Interface for querying external knowledge.
- **IVectorStore**: Semantic search and storage.
- **ITool**: Executable capabilities for agents.

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
- Standard Kernel: `AgentKernel`
- Specialist SDK: `AgentSDK`

### System Capabilities (Registries)
- **AgentRegistry**: Tracks available specialist agents.
- **ToolRegistry**: Tracks available connectors and internal tools.
- **ModelRegistry**: Tracks supported LLMs and providers.
- **PluginRegistry**: Tracks extensible system additions.

### Event Schema
- **EventType**: (TaskCreated, TaskAssigned, TaskStarted, TaskCompleted, TaskFailed, ToolInvoked, MemoryRead, MemoryWrite, ReasoningStarted, ReasoningCompleted, PolicyViolation, CostExceeded).
- **IEvent**: `{ id, type, timestamp, trace_id, agent_id, payload, metadata }`

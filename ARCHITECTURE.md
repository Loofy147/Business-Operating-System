# AI-BOS Architecture Specification

This document outlines the architectural foundation of the Business AI Operating System (AI-BOS).

## Design Principles

- **Contract-First**: All subsystems communicate through well-defined interfaces in `src/contracts/`.
- **Event-Driven**: The system state transitions and inter-agent communication are reactive, using standardized event schemas (`trace_id`, `span_id`).
- **State-Aware**: Agents follow a formal lifecycle state machine: Idle -> Planning -> Reasoning -> Tool Selection -> Execution -> Reflection -> Validation -> Memory Update -> Finished.
- **Feedback Loops**: Functional back-edges for `Retrying` (transient failures) and `Refining` (strategy adjustment via re-planning).
- **Model Arbitration**: Direct call chain where `IModelRouter.selectRequirements` generates requirements, and `IModelOptimizer.optimize` selects the final model configuration.
- **Separation of Concerns**: Decoupled layers for Intelligence, Memory, Orchestration, Optimization, and Governance.

## Core Components

### 1. Agent Kernel
Implemented in `src/agents/kernel.ts`, the kernel handles:
- **Identity & Goals**: Agent metadata and mission-alignment.
- **Lifecycle Management**: State machine ensuring predictable execution with integrated feedback loops.
- **Governance Gates**: Explicit calls to Request Validation, Pre-execution, and Post-execution gates.
- **Tiered Memory**: Integrated management of Working (task-scoped), Short-term (LRU), and Long-term (archival) memory.

### 2. Orchestration Layer
- **Scheduler**: Priority-based task management with retry logic.
- **Event Bus**: Centralized event distribution and observation.
- **Workflow Engine**: Management of complex multi-agent task dependencies.

### 3. Intelligence Layer
- **Model Router**: Translates tasks into `ModelRequirements` (reasoning depth, vision, context window).
- **Planning & Reasoning**: Specialized modules for decomposing tasks and generating logical outputs.

### 4. Knowledge & Memory Layer
- **Memory Tier Consolidation Policy**:
    - **Working Memory**: Ephemeral, task-scoped; explicitly cleared upon `Finished` state.
    - **Short-term Memory**: Session history with LRU eviction (limit 100) and promotion to LTM based on importance (>=8) or access frequency (>=5).
    - **Long-term Memory**: Persistent semantic storage for organizational knowledge.

### 5. Governance & Security
- **Three-Gate Validation**:
    1. **Request Validation**: Pre-planning risk assessment and restricted keyword check.
    2. **Pre-execution Check**: Verification of tool access and operational context.
    3. **Post-execution Safety Check**: Scanning outputs for sensitive data exposure or alignment failure.
- **Risk Assessment Taxonomy**: Evaluates Privacy, Operational, Financial, and Safety dimensions (1-5 scale). Tasks with total score > 12 or any single score >= 4 trigger mandatory HITL.

## Phase 2 Implementation Status

- [x] **Capability Registries**: Agents, Tools, Models, and Plugins registries implemented.
- [x] **Model Arbitration**: Separated requirements definition from model selection.
- [x] **Lifecycle Feedback Loops**: Added Retrying and Refining states with functional back-edges.
- [x] **Three-Gate Governance**: Integrated risk assessment and safety checks into the kernel flow.
- [x] **Tiered Memory Consolidation**: Implemented LRU eviction and promotion thresholds.
- [x] **Advanced Scheduling**: Priority-based orchestration with task cancellation and dynamic subtask scheduling.
- [x] **AI Evaluation Framework**: Automated scoring of reasoning quality and accuracy integrated into agent lifecycle.
- [x] **Extension SDKs**: Initial SDKs for Agents and Plugins defined.

## Data Flow
1. **User Request** -> Gateway
2. **Gateway** -> Policy Engine (**Gate 1: Request Validation**)
3. **Policy Engine** -> Executive Agent (**Planning**)
4. **Planner** -> Task Queue (**Scheduler**)
5. **Scheduler** -> Agent Engine -> Specialist Agent
6. **Specialist Agent** -> Policy Engine (**Gate 2: Pre-execution Check**)
7. **Policy Engine** -> Specialist Agent (**Lifecycle Execution**: Reasoning -> Tool Execution)
8. **Specialist Agent** -> Policy Engine (**Gate 3: Post-execution Safety Check**)
9. **Policy Engine** -> Result -> **Validation** (Pass/Fail)
    - If Fail -> **Retrying** (Loop to Execution) or **Refining** (Loop to Planning)
10. **Validation Pass** -> **Reflection** -> **Memory Update** -> **Orchestrator**
11. **Orchestrator** -> **Result** -> User

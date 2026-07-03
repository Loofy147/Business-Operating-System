# AI-BOS Architecture Specification

This document outlines the architectural foundation of the Business AI Operating System (AI-BOS).

## Design Principles

- **Contract-First**: All subsystems communicate through well-defined interfaces.
- **Event-Driven**: The system state transitions and inter-agent communication are reactive.
- **State-Aware**: Agents follow a formal lifecycle with feedback loops (Idle -> Planning -> Reasoning -> Execution -> Reflection -> Validation -> Memory Update -> Finished).
- **Separation of Concerns**: Decoupled layers for Intelligence, Memory, Orchestration, and Governance.

## Core Components

### 1. Agent Kernel
Every specialist agent is an instance of the `AgentKernel`, which implements:
- **Identity & Goals**: Metadata and mission-alignment.
- **Lifecycle Management**: State machine ensuring predictable execution with retry/refine loops.
- **Memory Access**: Integrated Working, Short-term, and Long-term memory.
- **Tooling**: Registration and execution of specialized capabilities.

### 2. Orchestration Layer
- **Scheduler**: Manages task priority and queueing.
- **Event Bus**: Distributed event distribution with standardized schemas.
- **Workflow Engine**: Coordinates complex multi-step task graphs.

### 3. Intelligence Layer
- **Model Router**: Determines model requirements (e.g., reasoning depth, vision support) based on task complexity.
- **Specialized Modules**: Decoupled Planner, Reasoner, and Evaluator.

### 4. Knowledge & Memory Layer
- **Working Memory**: Transient task context.
- **Short-term Memory**: Recent interaction history.
- **Long-term Memory**: Persistent organizational knowledge.
- **Knowledge Graph**: Relationship mapping between entities.
- **Vector Store**: Semantic retrieval for RAG.

### 5. Governance & Security
- **Policy Engine**: Mandatory pre-execution and post-execution validation gates.
- **IAM**: RBAC/ABAC for resource and tool access.
- **Observability**: Distributed tracing and centralized logging.

## Data Flow
1. User Request -> Gateway
2. Gateway -> Policy Engine (Request Validation)
3. Policy Engine -> Executive Agent (Planner)
4. Planner -> Task Queue (Scheduler)
5. Scheduler -> Agent Engine -> Specialist Agent
6. Specialist Agent -> Policy Engine (Pre-execution Check)
7. Policy Engine -> Specialist Agent (Lifecycle Execution)
8. Specialist Agent -> Policy Engine (Post-execution/Safety Check)
9. Policy Engine -> Result -> Reflection -> Memory Update -> Orchestrator
10. Orchestrator -> Result -> User

## Phase 2 Components

### 1. Capability Registries
Centralized registries for managing system extensions:
- **Agent Registry**: Dynamic lookup of specialized agents.
- **Tool Registry**: Inventory of available tools and their metadata.
- **Model Registry**: Catalog of supported LLMs and routing policies.
- **Plugin Registry**: Management of external capability modules.

### 2. Advanced Scheduling
- **Priority Queue**: Ensures critical tasks are processed first.
- **Retry Logic**: Automated recovery for transient task failures, feeding back into the agent lifecycle.

### 3. Optimization Modules
- **Cost/Latency Optimizer**: Receives model requirements from the Intelligence Layer and selects the most cost-effective provider/model that meets those requirements.
- **Semantic Cache**: Reduces redundant AI calls by caching common query results.

### 4. AI Evaluation Framework
- **Evaluator Engine**: Automated scoring of agent performance across accuracy, safety, and reasoning quality.

### 5. Extension SDKs
- **Agent SDK**: Standardized creation and configuration of agents.
- **Plugin SDK**: Base classes and utilities for developing system extensions.

### 6. Connectors
- **SaaS Connectors**: Initial mock implementations for Slack and GitHub integrations.

## Risk Assessment Taxonomy

The Governance Layer evaluates tasks and results across four primary dimensions:

| Dimension | Description | Scoring Scale |
|---|---|---|
| **Data Privacy** | Risk of sensitive data exposure (PII, PHI, Trade Secrets). | 1 (Public) - 5 (Highly Sensitive) |
| **Operational Impact** | Potential for disruption to critical business systems. | 1 (None) - 5 (System-wide Outage) |
| **Financial Risk** | Direct or indirect financial loss (e.g., unauthorized transactions). | 1 (<$100) - 5 (>$100k) |
| **Safety & Alignment** | Risk of generating harmful or misaligned content/actions. | 1 (Safe) - 5 (Hazardous) |

Tasks exceeding a total score of 12 or any single dimension score of 4 require mandatory human-in-the-loop (HITL) approval.

## Memory Tier Consolidation Policy

AI-BOS implements a tiered memory system with explicit promotion and eviction rules:

1.  **Working Memory (Context)**:
    - **Purpose**: Task-specific ephemeral data.
    - **Promotion**: None.
    - **Eviction**: Cleared upon task completion or transition to `Finished` state.

2.  **Short-term Memory (Recent History)**:
    - **Purpose**: Session-level context and recent agent interactions.
    - **Promotion**: Repeatedly accessed items or explicit "important" flags move to Long-term Memory.
    - **Eviction**: Least Recently Used (LRU) policy after 24 hours or 100 interaction spans.

3.  **Long-term Memory (Persistent)**:
    - **Purpose**: Durable organizational knowledge and agent history.
    - **Promotion**: Semantic clusters of high-confidence results are summarized and added to the Knowledge Graph.
    - **Eviction**: None (archival).

4.  **Knowledge Graph (Relationships)**:
    - **Purpose**: Mapping relationships between entities, projects, and policies.
    - **Consolidation**: Weekly automated indexing of Long-term Memory for relationship extraction.

5.  **Vector Store (Retrieval)**:
    - **Purpose**: Semantic search index for RAG across all memory tiers.
    - **Refresh**: Real-time indexing of all Memory tier writes.

# Rulebook Ingestion Process Flow

## Overview

This document describes the end-to-end flow for ingesting external regulatory obligations from third-party providers (e.g., Ascent) and making them available to tenants for subscription.

The ingestion process is orchestrated by AWS Step Functions state machine with 6 Lambda steps to handle large datasets and avoid timeout issues.

### High-Level Architecture

```mermaid
graph TB
    subgraph "External Provider"
        Ascent[Ascent API<br/>Third-Party Provider]
    end

    subgraph "Ingestion Service - Step Functions"
        SM[State Machine<br/>Orchestrator]
        Init[Lambda: Initialise]
        Prefetch[Lambda: Prefetch Tasks]
        Ingest[Lambda: Ingest<br/>Per Regulator]
        IngestOC[Lambda: Ingest Obligation Changes<br/>Per Regulator]
        Detect[Lambda: Change Detection<br/>Per Regulator]
        Conclude[Lambda: Conclude]
        S3[S3 Bucket<br/>Tasks + Changes]
    end

    subgraph "Event Distribution"
        EB[Regional EventBridge]
    end

    subgraph "Data Layer"
        DataLayer[data-layer<br/>Ingestion Handler]
        TenantDB[(Tenant PostgreSQL<br/>Databases)]
    end

    subgraph "User Features"
        Subscription[Subscription Service<br/>User Rule Visibility]
        Users[End Users]
    end

    Ascent -->|1. Fetch Regulators| Init
    SM -->|2. Orchestrate| Init
    Init -->|3. Regulators List| Prefetch
    Ascent -->|4. Bulk Fetch Tasks| Prefetch
    Prefetch -->|5. Store Tasks + Obligation Changes| S3
    S3 -->|6. Load Tasks| Ingest
    Ascent -->|7. Fetch Rules| Ingest
    S3 -->|8. Load Obligation Changes| IngestOC
    Ingest -->|9. Sequential Processing| IngestOC
    IngestOC -->|10. Sequential Processing| Detect
    Detect -->|11. Export Changes| S3
    Detect -->|12. Aggregate Results| Conclude
    Conclude -->|13. Compose Manifest| S3
    Conclude -->|14. Publish Event<br/>ExternalObligationsUpdated| EB
    EB -->|15. Org-Scoped Event| DataLayer
    DataLayer -->|16. Read from S3| S3
    DataLayer -->|17. Ingest Rules| TenantDB
    TenantDB -->|18. Query Available Rules| Subscription
    Subscription -->|19. User Subscribes| Users

    style SM fill:#fff4e1
    style Init fill:#e1f5ff
    style Prefetch fill:#e1f5ff
    style Ingest fill:#e1f5ff
    style IngestOC fill:#e1f5ff
    style Detect fill:#e1f5ff
    style Conclude fill:#e1f5ff
    style DataLayer fill:#e8f5e9
    style Subscription fill:#f3e5f5
```

## Step Functions Pipeline

The ingestion process is split into 6 distinct Lambda steps orchestrated by Step Functions:

1. **Initialise** - Create run, fetch regulators
2. **Prefetch** - Bulk-fetch tasks and obligation changes, store in S3 (Ascent-specific)
3. **Ingest** - Per-regulator rule ingestion (Map state, sequential)
4. **Ingest Obligation Changes** - Per-regulator obligation change ingestion from S3 (Map state, sequential)
5. **Detect Changes** - Per-regulator change detection for both obligations and obligation changes (Map state, sequential)
6. **Conclude** - Compose manifest, emit event, complete run

**Why Step Functions?** The monolithic Lambda approach hit timeout issues with large regulators (e.g., FCA). Breaking into steps allows each to run up to 15 minutes independently.

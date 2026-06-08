# Permissions Service

Handles data-layer events and updates Permit.io for authorization.

## Architecture Overview

```mermaid
flowchart TB
    subgraph Client["Client Application"]
        UI[Web UI]
    end

    subgraph RequestAPI["Request State API"]
        RSA[Request Handler]
        ES[Event Store]
    end

    subgraph DataLayer["Data Layer Service"]
        DL[Data Layer Handler]
        DB[(PostgreSQL)]
    end

    subgraph Permissions["Permissions Service"]
        PH[Permissions Handler]
        subgraph Handlers["Event Handlers"]
            IH[Insert Handler]
            UH[Update Handler]
            DH[Delete Handler]
        end
    end

    subgraph EventBridge["AWS EventBridge"]
        EB[Event Bus]
    end

    subgraph Permit["Permit.io"]
        PDP[Policy Decision Point]
        RI[Resource Instances]
        RT[Relationship Tuples]
        RA[Role Assignments]
    end

    UI -->|1. API Request| RSA
    RSA -->|2. INITIATE_ASYNC_REQUEST| EB
    EB -->|3. Process Request| DL
    DL -->|4. Write to DB| DB
    DL -->|5. OBJECT_CREATED/UPDATED/DELETED, etc.| EB
    EB -->|6. Trigger Handler| PH
    PH --> Handlers
    IH & UH -->|7. Fetch Enriched Node| DL
    DL -->|8. Return Entity + Relations| IH & UH
    IH & UH & DH -->|9. Sync Permissions| Permit
    PH -->|10. PERMISSIONS_UPDATED| EB
    EB -->|11. Update Request State| RSA
    RSA -->|12. Store Result| ES
```

## Event Flow

```mermaid
sequenceDiagram
    participant DL as Data Layer
    participant EB as EventBridge
    participant PS as Permissions Service
    participant API as Data Layer API
    participant Permit as Permit.io

    DL->>EB: OBJECT_CREATED / OBJECT_UPDATED / OBJECT_DELETED
    EB->>PS: Trigger Lambda Handler

    alt OBJECT_CREATED or OBJECT_UPDATED
        PS->>API: getEnrichedNodes(nodeIds)
        API-->>PS: EnrichedNode[] (parents, owners, contributors, groups)
    end

    alt OBJECT_CREATED
        PS->>Permit: Create Resource Instance
        PS->>Permit: Link to Root Node
        PS->>Permit: Create Parent Relationships
        PS->>Permit: Assign User Roles (owners, contributors)
        PS->>Permit: Create Group Relationships
    else OBJECT_UPDATED
        PS->>Permit: Get Current State
        PS->>Permit: Sync Relationships (add new, remove stale)
        PS->>Permit: Sync Role Assignments
        PS->>Permit: Sync Group Relationships
    else OBJECT_DELETED
        PS->>Permit: Delete Resource Instance
        Note over Permit: Cascades relationship cleanup
    end

    PS->>EB: PERMISSIONS_UPDATED / PERMISSIONS_UPDATE_FAILED
```

## V3 Event-Driven System Integration

The Permissions Service is a core component of the V3 event-driven architecture. This diagram shows how it integrates with other services:

```mermaid
flowchart LR
    subgraph Sources["Event Sources"]
        RSA[Request State API]
    end

    subgraph EventBus["AWS EventBridge"]
        EB((Event Bus))
    end

    subgraph Consumers["Event Consumers"]
        DL[Data Layer Service]
        PS[Permissions Service]
        RSA2[Request State API]
    end

    subgraph ExternalServices["External Services"]
        Permit[Permit.io]
        DB[(PostgreSQL)]
    end

    %% Event Flow
    RSA -->|INITIATE_ASYNC_REQUEST| EB
    EB -->|Subscribe| DL
    DL -->|Read/Write| DB
    DL -->|OBJECT_CREATED<br/>OBJECT_UPDATED<br/>OBJECT_DELETED| EB
    EB -->|Subscribe| PS
    PS -->|Sync Permissions| Permit
    PS -->|PERMISSIONS_UPDATED<br/>PERMISSIONS_UPDATE_FAILED| EB
    EB -->|Subscribe| RSA2

    style PS fill:#f9f,stroke:#333,stroke-width:2px
    style EB fill:#ff9,stroke:#333,stroke-width:2px
```

## Glossary

| Term | Definition |
|------|------------|
| **Resource Instance** | A Permit.io representation of an entity (e.g., risk, control) with a unique key |
| **Relationship Tuple** | A connection between two resources in Permit (e.g., parent-child, group membership) |
| **Role Assignment** | Grants a user a specific role on a resource instance (e.g., owner, contributor) |
| **Enriched Node** | Entity data from data-layer including linked items, owners, contributors, and groups |
| **PDP** | Policy Decision Point - Permit's authorization engine that evaluates access requests |
| **Tenant** | Isolated organization context for multi-tenant authorization |
| **Object Type** | The type of resource (risk, control, document, etc.) mapped to Permit resource types |
| **Owner** | User role with full control over a resource |
| **Contributor** | User role with edit access to a resource |
| **Owner Group** | Group-based owner role assignment for batch permissions |
| **Contributor Group** | Group-based contributor role assignment for batch permissions |
| **Root Node** | The top-level parent resource instance (organization-level) for permission inheritance |
| **Parent-Child Relationship** | Hierarchical link enabling permission inheritance between entities |
| **Correlation ID** | Unique identifier for tracing events across the distributed system |

## Handlers

### Insert Permissions Handler

Processes object creation events. It:
1. Fetches the enriched node from the data layer (including linked items, owners, and contributors)
2. Creates a resource instance in Permit with parent-child relationships
3. Syncs user and group role assignments (owners, owner groups, contributors, contributor groups)
4. Emits a `permissions-updated` or `permissions-update-failed` event

### Update Permissions Handler

Processes object update events. It:
1. Receives a thin event with objectId and objectType
2. Fetches the enriched node from the data layer
3. Checks if the resource instance exists in Permit before proceeding
4. Compares current Permit state with desired state and syncs accordingly(adds new, removes old):
   - Parent-child relationships
   - Owner role assignments
   - Contributor role assignments
   - Owner group relationship tuples
   - Contributor group relationship tuples
   NB: Skips creation of resource and linking to root node(only done once on insert)
5. Emits a `permissions-updated` or `permissions-update-failed` event

### Delete Permissions Handler

Processes object deletion events. It:
1. Deletes the resource instance from Permit (Permit will handle the cascading unlinking of relationships and role assignments)
2. Emits a `permissions-updated` or `permissions-update-failed` event

## Running the Service via local stack

1. If not set, add correct variables in the the `cdk-stack` `.env` file. You can copy from `.env.example`:
```
TENANT_CONFIG_TABLE
LOCAL_DATABASE_CONNECTION_STRING
DYNAMODB_ENDPOINT
PDP_ENDPOINT
LOCAL_PDP_API_KEY
```

2. If not on, start the relevant containers from the root of the project:
- `docker-compose --profile v3 up --build -d --wait` to set up all the containers needed for local development.

3. Start local Lambda services (CDK synth + SAM + event routing):
```
node scripts/dev.js
```

4. Trigger a manual permission sync:
```
bash packages/permitio/sync-permit.sh
```

Alternatively, for testing just the permissions service:
Populate a test event in `services/permissions/src/tests/events` with the relevant objectId and objectType (e.g. Id found in action_update table) and run desired action e.g.:
```
cd services/permissions
pnpm run putEvent:objectDeleted
```

# Clean Architecture Style Guide

## Table of Contents

- [Overview](#overview)
- [Architecture comparison](#architecture-comparison)
  - [❌ Legacy pattern](#-legacy-pattern)
  - [✅ Clean architecture pattern](#-clean-architecture-pattern)
- [Core principles](#core-principles)
  - [1. Dependency inversion](#1-dependency-inversion)
  - [2. Separation of concerns](#2-separation-of-concerns)
  - [3. Domain modeling](#3-domain-modeling)
  - [4. Explicit commands and queries](#4-explicit-commands-and-queries)
- [Layer responsibilities](#layer-responsibilities)
  - [1. Controller layer](#1-controller-layer)
  - [2. Use case layer](#2-use-case-layer)
  - [3. Adaptors layer](#3-adaptors-layer)
- [Implementation guide](#implementation-guide)
  - [Step-by-Step: Creating a new use case](#step-by-step-creating-a-new-use-case)
- [Dos and don'ts](#dos-and-donts)
  - [Structure and organization](#structure-and-organization)
  - [Dependency Management](#dependency-management)
  - [Business Logic](#business-logic)
  - [Type Safety](#type-safety)
  - [Error Handling](#error-handling)
  - [Testing](#testing)
  - [Data Access](#data-access)
  - [Reusability](#reusability)
- [Migration Path](#migration-path)
- [Summary](#summary)
  - [Key Takeaways](#key-takeaways)
  - [Quick Reference](#quick-reference)
- [Further Reading](#further-reading)

---

## Overview

This guide defines the clean architecture pattern we would like to follow and uses an example `packages/rest-api/src/handlers/attestation-cycle` to provide guidelines for creating new use cases following this pattern.

**Key Benefits:**

- **Testability**: Pure business logic with no infrastructure dependencies
- **Maintainability**: Clear separation of concerns
- **Flexibility**: Easy to swap out data sources or delivery mechanisms
- **Domain-Driven**: Business rules are explicit and centralized

---

## Architecture comparison

### ❌ Legacy pattern

**Example: `packages/rest-api/src/handlers/risk/post.ts`**

```typescript
export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);
  const apiClient = getRisksmartApiClient(hasuraClient);

  // ❌ Business logic mixed with infrastructure
  const parent = await getNode(hasuraClient, input.ParentRiskId);

  // ❌ Permission checks inline with data operations
  const permissionGranted = await hasPermission(hasuraClient, {
    userId: sessionData.userId,
    parentObject: parent,
    objectType: ParentTypeEnum.Risk,
    accessType: AccessTypeEnum.Insert,
  });

  // ❌ Direct database mutations in handler
  const result = await apiClient.insertChildRisk({
    Id: id,
    ParentRiskId: input.ParentRiskId,
    Title: input.Title,
    // ... many fields
  });

  // ❌ Side effects buried in handler
  await refreshRiskScheduleState({ riskId, session: sessionData });

  return {
    statusCode: 200,
    body: JSON.stringify({ Id: result.insert_risk_one?.Id }),
  };
});
```

**Problems:**

- Business logic tightly coupled to Hasura GraphQL client
- Cannot test without mocking GraphQL infrastructure
- Difficult to understand business rules
- Hard to reuse logic in different contexts (CLI, events, scheduled jobs)
- Changes to data layer require changes to business logic

### ✅ Clean architecture pattern

**Example: `packages/rest-api/src/services/attestation-cycle/add-user-to-audience-handler/`**

**Handler (Business Logic):**

```typescript
// add-user-to-audience-handler.ts
interface Dependencies {
  getGlobalAttestationCycle: () => Promise<AttestationCycle[]>;
  getAttestationCycleByUserGroup: (
    userGroups: UserGroupId[]
  ) => Promise<AttestationCycle[]>;
  createAttestationRecord: (
    attestationRecord: CreateAttestationRecord
  ) => Promise<AttestationRecordId>;
  updateAttestationRecordStatus: (
    attestationRecord: AttestationRecord
  ) => Promise<void>;
}

export const addUserToAudienceCommandHandler = (deps: Dependencies) => {
  const execute = async ({
    userId,
    userGroupId,
  }: AddUserToAudienceCommand): Promise<void> => {
    // ✅ Pure business logic with no infrastructure dependencies
    const cycles = userGroupId
      ? await deps.getAttestationCycleByUserGroup([userGroupId])
      : await deps.getGlobalAttestationCycle();

    for (const cycle of cycles) {
      const record = cycle.records.find((r) => r.userId === userId);

      if (!record) {
        // this is a domain method to create a new, valid attestation record
        const newRecord = createAttestationRecord({
          attestationCycle: cycle,
          userId,
        });
        await deps.createAttestationRecord(newRecord);
        continue;
      }

      // "canBeActivated" is a domain method of the entity which will be imported
      if (canBeActivated(record)) {
        const activatedRecord = asActive(record);
        await deps.updateAttestationRecordStatus(activatedRecord);
        continue;
      }

      throw new Error(`Unexpected attestation record status`);
    }
  };

  return { execute };
};
```

> Note: ⚠️ Most examples in the attestation-cycle folder currently use 'reader' and 'writer' in their names. We've decided against this and decided to go with a less verbose 'getFoo', 'saveBar', 'updateBaz' approach.

**Factory (Dependency Wiring):**

```typescript
// index.ts
export const createAddUserToAudienceCommandHandler = (opts: ServiceOptions) => {
  // ✅ All infrastructure dependencies wired here
  const { getByUserGroup, getAllActiveGlobal } =
    AttestationCycleDataAdaptor(opts);
  const { create, updateStatus } = AttestationRecordAdaptor(opts);

  return addUserToAudienceCommandHandler({
    getGlobalAttestationCycle: getAllActiveGlobal,
    getAttestationCycleByUserGroup: getByUserGroup,
    createAttestationRecord: create,
    updateAttestationRecordStatus: updateStatus,
  });
};
```

**HTTP Handler (Entry Point):**

```typescript
// events/on-organisation-user-changed.ts
export const handler = singleEventBridgeHandler(async (event) => {
  const session = getSessionData(event.detail.event?.session_variables);

  // ✅ Create handler with session context
  const handler = createAddUserToAudienceCommandHandler(session);

  const command: AddUserToAudienceCommand = {
    userId: userIdSchema.parse(item.User_Id),
    userGroupId: null,
  };

  // ✅ Execute business logic
  await handler.execute(command);
});
```

**Benefits:**

- Business logic is pure and testable with simple mocks
- Can be used from any entry point (REST, EventBridge, CLI, scheduled jobs)
- Domain entities and rules are explicit
- Infrastructure can be swapped without changing business logic

---

## Core principles

### 1. Dependency inversion

**Don't depend on concrete implementations, depend on abstractions (interfaces).**

```typescript
// ✅ DO: Define interface for dependencies
interface Dependencies {
  createAttestationCycle: (
    cycle: CreateAttestationCycle
  ) => Promise<AttestationCycleId>;
  getDocumentFile: (
    documentId: string
  ) => Promise<{ id: DocumentFileId } | null>;
}

// ❌ DON'T: Depend on concrete implementations
const handler = (hasuraClient: ApolloClient, apiClient: RisksmartApiClient) => {
  // Business logic here
};
```

### 2. Separation of concerns

**Business logic, infrastructure, and presentation should be in separate layers.**

```typescript
// ✅ DO: Orchestrate business processes in handlers
export const createAttestationCycleCommandHandler = (deps: Dependencies) => ({
  execute: async (command: CreateAttestationCycleCommand) => {
    const activeDocumentFile = await deps.getDocumentFile(command.documentId);

    if (!activeDocumentFile) {
      throw new Error(`No published document file found`);
    }

    const createAttestationCycle = createAttestationCycleSchema.parse({
      status: 'active',
      parentId: activeDocumentFile.id,
      allowCarryForward: command.allowCarryForward,
    });

    return await deps.createAttestationCycle(createAttestationCycle);
  },
});

// ✅ DO: Infrastructure in adaptors which deal with domain types
// And define adaptor interface for swappable implementations
interface AttestationCycleDataAdaptor {
  create: (cycle: CreateAttestationCycle) => Promise<AttestationCycleId>;
}

export const createAttestationCycleDataAdaptor = (opts: ServiceOptions): AttestationCycleDataAdaptor => {
  const client = getHasuraBackendClient(opts);

  return {
    create: async (cycle: CreateAttestationCycle) => {
      const { data, errors } = await client.mutate({
        mutation: InsertAttestationCycleDocument,
        variables: {
          object: {
            /* ... */
          },
        },
      });
      // ... error handling and transformation
    },
  };
};

// ❌ DON'T: Mix business logic with infrastructure
export const handler = backendRouteHandler(schema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);

  // Business logic mixed with Hasura calls
  if (input.Tier === 1) {
    const canInsertTier1Risk = await hasPermission(hasuraClient, {
      /* ... */
    });
  }

  const result = await apiClient.insertChildRisk({
    /* ... */
  });
});
```

### 3. Domain modeling

**Use rich domain models with behavior, not anemic data structures.**

```typescript
// ✅ DO: Domain entities with business rules, use pure functions.
export const canBeConcludedNaturally = (cycle: AttestationCycle): boolean => {
  return cycle.records.every(
    (record) => record.status === 'attested' || record.status === 'not_required'
  );
};

export const asConcludedNaturally = (
  cycle: AttestationCycle
): ConcludedAttestationCycle => {
  if (!canBeConcludedNaturally(cycle)) {
    throw new Error(
      `Attestation cycle cannot be concluded as not all records are attested`
    );
  }
  return asConcluded(cycle);
};

// ❌ DON'T: Anemic models with logic scattered in services
export const checkIfCanConclude = (records: any[]) => {
  // Logic separated from domain model
  return records.every(
    (r) => r.status === 'attested' || r.status === 'not_required'
  );
};
```

### 4. Explicit commands and queries

**Use typed commands/queries for all operations.**

```typescript
// ✅ DO: Define explicit command types
export type AddUserToAudienceCommand = Readonly<{
  userId: UserId;
  userGroupId: UserGroupId | null;
}>;

interface AddUserToAudienceCommandHandler {
  execute(command: AddUserToAudienceCommand): Promise<void>;
}

// ❌ DON'T: Use generic/loose parameters
export const addUserToAudience = async (
  hasuraClient: any,
  userId: string,
  userGroupId?: string | null
) => {
  // Implementation
};
```

---

## Layer responsibilities

### 1. Controller layer

**Responsibility:** Entry points that translate external requests to commands/queries.

**Should:**

- Parse and validate input
- Extract session/authentication data
- Create command handler with dependencies
- Execute command and return response
- Handle HTTP-specific concerns (status codes, headers)

**Should NOT:**

- Contain business logic
- Directly access databases
- Perform complex transformations

```typescript
// ✅ DO: Thin handler
export const handler = backendRouteHandler(schema, async (event) => {
  const sessionData = getSessionData(event.session_variables);
  const handler = buildAttestationCycleCommandHandler(sessionData);

  const attestationCycleId = await handler.execute({
    documentId: event.input.object.DocumentId,
    allowCarryForward: event.input.object.AllowCarryForward,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ Id: attestationCycleId }),
  };
});

// ❌ DON'T: Fat handler with business logic
export const handler = backendRouteHandler(PostSchema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);

  // Complex validation
  if (input.Tier === 1) {
    const canInsertTier1Risk = await hasPermission(/* ... */);
    if (!canInsertTier1Risk) throw new Forbidden('Access denied');
  }

  // Business rules
  const id = randomUUID();
  const result = await apiClient.insertChildRisk({
    /* ... */
  });

  // Side effects
  await refreshRiskScheduleState({ riskId, session: sessionData });

  return {
    /* ... */
  };
});
```

### 2. Use case layer

**Responsibility:** Business logic, domain entities, and use case implementations.

#### a) Command/Query handlers

**Should:**

- Implement pure business logic
- Use dependency injection for all I/O operations
- Return domain entities
- Be fully unit testable with mocks

**Should NOT:**

- Know about Hasura, GraphQL, or any infrastructure
- Handle HTTP concerns
- Contain database queries

```typescript
// ✅ DO: Pure command handler
interface Dependencies {
  getAttestationCycle: (id: AttestationCycleId) => Promise<AttestationCycle>;
  updateAttestationRecords: (records: AttestationRecordId[]) => Promise<void>;
}

export const archiveAttestationRecordsCommandHandler = (
  deps: Dependencies
) => ({
  execute: async (command: ArchiveAttestationRecordsCommand): Promise<void> => {
    const cycle = await deps.getAttestationCycle(command.cycleId);

    if (!canBeArchived(cycle)) {
      throw new Error('Attestation cycle cannot be archived');
    }

    const recordsToArchive = cycle.records
      .filter(shouldBeArchived)
      .map(asArchived);

    await deps.updateAttestationRecords(recordsToArchive.map((r) => r.id));
  },
});
```

#### b) Domain entities

**Should:**

- **Use Zod schemas for validation** - Ensures runtime type safety and consistent validation across all layers. Catches invalid data at system boundaries before it reaches business logic.
- **Include business rules as pure functions** - Makes business logic explicit, testable, and reusable. Pure functions are easier to reason about and don't have hidden side effects.
- **Be immutable** - Prevents accidental mutations that can lead to bugs. Makes code predictable and safe for concurrent operations.
- **Use branded types for IDs** - Prevents mixing different ID types (e.g., passing a `RiskId` where a `ControlId` is expected). Catches errors at compile time rather than runtime.

**Should NOT:**

- **Depend on infrastructure** - Domain logic should work regardless of database, API, or framework choices. This allows you to swap infrastructure (e.g., Hasura → Drizzle) without touching business rules.
- **Contain I/O operations** - I/O makes functions impure and hard to test. Keep domain entities synchronous and side-effect free.

```typescript
// ✅ DO: Rich domain model
export const attestationCycleSchema = z.object({
  id: attestationCycleIdSchema,
  status: attestationCycleStatusEnumSchema,
  records: z.array(attestationRecordSchema),
  // ...
});

export type AttestationCycle = Readonly<z.infer<typeof attestationCycleSchema>>;

export const canBeConcludedNaturally = (cycle: AttestationCycle): boolean => {
  return cycle.records.every(
    (record) => record.status === 'attested' || record.status === 'not_required'
  );
};

export const asConcludedNaturally = (
  cycle: AttestationCycle
): ConcludedAttestationCycle => {
  if (!canBeConcludedNaturally(cycle)) {
    throw new Error('Cannot conclude attestation cycle');
  }
  return concludedAttestationCycleSchema.parse({
    ...cycle,
    status: 'concluded',
    concludedAtTimestamp: dayjs().toISOString(),
  });
};

// ❌ DON'T: Anemic model with no business logic
// Why: Forces business rules to scatter across handlers and services,
// making them hard to find, test, and maintain
export type AttestationCycle = {
  id: string;
  status: string;
  records: any[];
};
```

#### c) Factory functions

**Should:**

- **Wire dependencies (index.ts files)** - Centralizes all dependency setup in one place. Makes it easy to see what infrastructure a handler needs.
- **Create handler instances** - Separates construction from business logic. Enables dependency injection for testing.
- **Translate between infrastructure and domain** - Maps infrastructure-specific method names to domain-meaningful dependency names that handlers expect.

**Should NOT:**

- **Contain business logic** - Factories are for wiring only. Business logic belongs in handlers or domain entities where it can be properly tested.

```typescript
// ✅ DO: Clean factory
export const createAddUserToAudienceCommandHandler = (opts: ServiceOptions) => {
  const { getByUserGroup, getAllActiveGlobal } =
    AttestationCycleDataAdaptor(opts);
  const { create, updateStatus } = AttestationRecordAdaptor(opts);

  return addUserToAudienceCommandHandler({
    getGlobalAttestationCycle: getAllActiveGlobal,
    getAttestationCycleByUserGroup: getByUserGroup,
    createAttestationRecord: create,
    updateAttestationRecordStatus: updateStatus,
  });
};
```

### 3. Adaptors layer

**Responsibility:** Translate between domain models and infrastructure (Hasura, services, etc.).

**Should:**

- **Implement dependency interfaces from handlers** - Fulfills the contract that handlers expect. Enables swapping implementations (e.g., Hasura → Drizzle).
- **Handle data transformation** - Converts raw database/API responses into validated domain types. Isolates infrastructure changes from business logic.
- **Deal with (accept and return) domain types** - Ensures type safety across boundaries. Handlers never see infrastructure-specific types.
- **Manage GraphQL/database operations** - Encapsulates all I/O in one place. Makes it easy to optimize queries or switch databases.
- **Handle errors and retries** - Translates infrastructure errors into domain-meaningful errors. Implements resilience patterns without cluttering handlers.

**Should NOT:**

- **Contain business logic** - Business rules belong in handlers or domain entities. Adaptors should be "dumb pipes" that just fetch/persist data.
- **Make business decisions** - Adaptors don't know what data means or when it's valid. They just do what handlers tell them.

```typescript
// ✅ DO: Adaptor with clear responsibilities
// And define adaptor interface for swappable implementations
interface AttestationCycleDataAdaptor {
  getById: (id: AttestationCycleId): Promise<AttestationCycle>;
  create: (cycle: CreateAttestationCycle): Promise<AttestationCycleId>;
}

export const createAttestationCycleDataAdaptor = (opts: ServiceOptions): AttestationCycleDataAdaptor => {
  const client = getHasuraBackendClient(opts);

  return {
    getById: async (id: AttestationCycleId): Promise<AttestationCycle> => {
      const result = await client.query({
        query: GetAttestationCyclesDocument,
        variables: { where: { Id: { _eq: id } } },
      });

      if (!result.data?.attestation_cycle[0]) {
        throw new Error(`Failed to retrieve attestation cycle by ID: ${id}`);
      }

      return transformAttestationCycleFromData(
        result.data.attestation_cycle[0]
      );
    },

    create: async (
      cycle: CreateAttestationCycle
    ): Promise<AttestationCycleId> => {
      const { data, errors } = await client.mutate({
        mutation: InsertAttestationCycleDocument,
        variables: {
          object: {
            ParentId: cycle.parentId,
            AllowCarryForward: cycle.allowCarryForward,
            Status: cycle.status,
          },
        },
      });

      if (!data?.insert_attestation_cycle_one || errors) {
        throw new Error(`Failed to create attestation cycle`);
      }

      return attestationCycleIdSchema.parse(
        data.insert_attestation_cycle_one.Id
      );
    },
  };
};

// ❌ DON'T: Mix business logic in adaptor
// Why: Business rules are now tied to infrastructure. Can't test validation
// without a database. Can't reuse logic across different entry points.
export const createAttestationCycleDataAdaptor = (opts: ServiceOptions) => {
  return {
    create: async (cycle: CreateAttestationCycle) => {
      // ❌ Business validation in adaptor - this belongs in a handler!
      if (cycle.allowCarryForward && !hasValidRecords(cycle)) {
        throw new Error('Cannot carry forward without valid records');
      }

      // ... database operations
    },
  };
};
```

---

## Implementation guide

### Step-by-Step: Creating a new use case

Let's create a new use case: **Archive Risk** following clean architecture.

#### Step 1: Define domain entities

```typescript
// ../risk/risk.ts
import z from 'zod';

export const riskIdSchema = z.string().uuid().brand('RiskId');
export type RiskId = z.infer<typeof riskIdSchema>;

export const riskStatusSchema = z.enum(['active', 'archived', 'draft']);
export type RiskStatus = z.infer<typeof riskStatusSchema>;

export const riskSchema = z.object({
  id: riskIdSchema,
  title: z.string(),
  status: riskStatusSchema,
  tier: z.number().int().min(1).max(3),
  hasActiveControls: z.boolean(),
  createdAt: z.string().datetime(),
});

export type Risk = Readonly<z.infer<typeof riskSchema>>;

export const archivedRiskSchema = riskSchema.extend({
  status: z.literal('archived'),
  archivedAtTimestamp: z.string().datetime(),
  archivedByUser: z.string().uuid(),
});

export type ArchivedRisk = Readonly<z.infer<typeof archivedRiskSchema>>;

// Business rules
export const canBeArchived = (risk: Risk): boolean => {
  return risk.status === 'active' && !risk.hasActiveControls;
};

export const asArchived = (risk: Risk, archivedBy: string): ArchivedRisk => {
  if (!canBeArchived(risk)) {
    throw new Error(
      `Risk ${risk.id} cannot be archived: ${
        risk.hasActiveControls ? 'has active controls' : 'invalid status'
      }`
    );
  }

  return archivedRiskSchema.parse({
    ...risk,
    status: 'archived',
    archivedAtTimestamp: new Date().toISOString(),
    archivedByUser,
  });
};
```

#### Step 2: Create command handler

```typescript
// ../risk/archive-risk-command-handler/archive-risk-command-handler.ts
import z from 'zod';
import type { Risk, RiskId } from '../risk';
import { asArchived, canBeArchived, riskIdSchema } from '../risk';

const archiveRiskCommandSchema = z.object({
  riskId: riskIdSchema,
  archivedBy: z.string().uuid(),
});

export type ArchiveRiskCommand = Readonly<
  z.infer<typeof archiveRiskCommandSchema>
>;

interface ArchiveRiskCommandHandler {
  execute(command: ArchiveRiskCommand): Promise<void>;
}

interface Dependencies {
  getRisk: (id: RiskId) => Promise<Risk>;
  saveRisk: (risk: Risk) => Promise<void>;
}

export const archiveRiskCommandHandler = (
  deps: Dependencies
): ArchiveRiskCommandHandler => ({
  execute: async (command: ArchiveRiskCommand): Promise<void> => {
    const risk = await deps.getRisk(command.riskId);

    if (!canBeArchived(risk)) {
      throw new Error(
        `Risk cannot be archived: ${
          risk.hasActiveControls
            ? 'Archive controls first'
            : 'Risk is not active'
        }`
      );
    }

    const archivedRisk = asArchived(risk, command.archivedBy);

    // Persist archived risk
    await deps.saveRisk(archivedRisk);
  },
});
```

#### Step 3: Create adaptors

```typescript
// ../risk/adaptors/risk-data-adaptor.ts
import { GetRiskDocument, UpdateRiskDocument } from 'generated/graphql';
import { getHasuraBackendClient } from 'src/backendGraphqlClient';
import type { ServiceOptions } from 'src/services/types';
import type { Risk, RiskId } from '../risk';
import { riskIdSchema } from '../risk';
import { transformRiskFromData } from './transform';
// ✅ DO: Define adaptor interface for swappable implementations
interface RiskDataAdaptor {
  getById: (id: RiskId) => Promise<Risk>;
  update: (risk: Risk) => Promise<void>;
}

export const createRiskDataAdaptor = (opts: ServiceOptions): RiskDataAdaptor => {
  const client = getHasuraBackendClient(opts);

  return {
    getById: async (id: RiskId): Promise<Risk> => {
      const result = await client.query({
        query: GetRiskDocument,
        variables: { id },
      });

      if (!result.data?.risk_by_pk) {
        throw new Error(`Risk not found: ${id}`);
      }

      return transformRiskFromData(result.data.risk_by_pk);
    },

    update: async (risk: Risk): Promise<void> => {
      const { errors } = await client.mutate({
        mutation: UpdateRiskDocument,
        variables: {
          id: risk.id,
          set: {
            Status: risk.status,
            ArchivedAt: 'archivedAt' in risk ? risk.archivedAt : null,
            ArchivedBy: 'archivedBy' in risk ? risk.archivedBy : null,
          },
        },
      });

      if (errors) {
        throw new Error(
          `Failed to update risk: ${errors.map((e) => e.message).join(', ')}`
        );
      }
    },
  };
};
```

```typescript
// src/risk/archive-risk-command-handler/adaptors/transform.ts
import type { GetRiskQuery } from 'generated/graphql';
import type { Risk } from '../risk';
import { riskIdSchema, riskSchema } from '../risk';

export const transformRiskFromData = (
  data: GetRiskQuery['risk_by_pk']
): Risk => {
  if (!data) {
    throw new Error('Invalid risk data');
  }

  return riskSchema.parse({
    id: riskIdSchema.parse(data.Id),
    title: data.Title,
    status: data.Status,
    tier: data.Tier,
    hasActiveControls: data.controls.some((c) => c.Status === 'active'),
    createdAt: data.CreatedAtTimestamp,
  } satisfies Record<keyof z.input<typeof riskSchema>, unknown>);

  // the satisfies constraint ensures consistency with domain object.
  // As without it, an error will be thrown at runtime if a new field is added, but wont be caught at dev time.
};
```

#### Step 4: Create factory

```typescript
// ../risk/archive-risk-command-handler/index.ts
import type { ServiceOptions } from 'src/services/types';
import { RiskDataAdaptor } from '../adaptors/risk-data-adaptor';
import { ControlService } from '../../control/control.service';
import { archiveRiskCommandHandler } from './archive-risk-command-handler';

export const createArchiveRiskCommandHandler = (opts: ServiceOptions) => {
  const { getById: getRisk, update: saveRisk } = RiskDataAdaptor(opts);

  return archiveRiskCommandHandler({
    getRisk,
    saveRisk,
  });
};
```

#### Step 5: Create handler

```typescript
// src/handlers/risk/archive.ts
import { backendRouteHandler } from 'src/backendActionApiHandler';
import { getLogger } from 'src/logger';
import { createArchiveRiskCommandHandler } from 'src/services/risk/archive-risk-command-handler';
import { getSessionData } from 'src/session';
import { z } from 'zod';

const logger = getLogger();

const schema = z.object({
  object: z.object({
    RiskId: z.string().uuid(),
  }),
});

export const handler = backendRouteHandler(schema, async (event) => {
  const sessionData = getSessionData(event.session_variables);
  const handler = createArchiveRiskCommandHandler(sessionData);

  logger.info('Archiving risk', { riskId: event.input.object.RiskId });

  await handler.execute({
    riskId: event.input.object.RiskId,
    archivedBy: sessionData.userId,
  });

  logger.info('Risk archived successfully', {
    riskId: event.input.object.RiskId,
  });

  return {
    statusCode: 200,
    body: JSON.stringify({ success: true }),
  };
});
```

#### Step 6: Write unit tests

- ✅ DO Test domain logic. Cover handler, and domain entities.
- ✅ DO Test data transformations

- ❌ DON'T test index.ts
- ❌ DON'T test adaptors
- ❌ DON'T test infrastructure

---

## Dos and don'ts

### Structure and organization

| ✅ DO                                                      | ❌ DON'T                                                                |
| ---------------------------------------------------------- | ----------------------------------------------------------------------- |
| Organize by feature/domain (`services/attestation-cycle/`) | Organize by technical layer (`services/`, `repositories/`, `handlers/`) |
| Keep handler in dedicated folder with test and index       | Mix all handlers in single folder                                       |
| Use descriptive names (`archive-risk-command-handler`)     | Use generic names (`service.ts`, `handler.ts`)                          |
| Share adaptors across use cases in `adaptors/` directory   | Duplicate adaptor code in each use case folder                          |

> **Note:** Adaptors/repositories are the exception to organizing by use case. They are typically shared across multiple use cases within a feature/domain and should live in a common `adaptors/` directory (e.g., `services/risk/adaptors/risk-data-adaptor.ts`). This allows multiple command handlers to reuse the same data access logic without duplication.

**Example folder structure:**

✅ DO: Screaming architecture that lets you understand at a glance what the code does.

```
services/
  risk/
    adaptors/                              # Infrastructure Layer (✅ Shared)
      risk-db-adaptor/                     # Database adaptor
        adaptor.ts                         # Data access implementation
        transform.ts                       # DB ↔ Domain transformations
        types.ts                           # Adaptor-specific types
      control-service-adaptor/             # External service adaptor
        adaptor.ts
        transform.ts
      types.ts                             # Shared adaptor utilities

    domain/                                # Domain Layer (Business Logic)
      types.ts                             # Domain models (Risk, ArchivedRisk)
      services/                            # Domain services (optional)
        risk-validation-service.ts         # Complex business rules

    handlers/                              # Application Layer (Use Cases)
      archive-risk/                        # Use case 1
        archive-risk-handler.ts            # Handler - orchestrates workflow
        archive-risk-handler.test.ts       # Unit tests
        index.ts                           # Composition root (wires dependencies)

      update-risk/                         # Use case 2
        update-risk-handler.ts
        update-risk-handler.test.ts
        index.ts

      create-risk/                         # Use case 3
        create-risk-handler.ts
        create-risk-handler.test.ts
        index.ts
```

❌ DON'T: Legacy structure

You need to open and read the files to understand what they do.

```
packages/rest-api/src/
├── handlers/
│   └── risk/
│       ├── post.ts        # ❌ Business logic + infrastructure + presentation mixed
│       ├── put.ts
│       ├── delete.ts
│       └── schema.ts
│
└── services/
    └── control/
        └── controlService.ts  # ❌ Service functions that do too much
```

### Dependency Management

| ✅ DO                                                 | ❌ DON'T                                  |
| ----------------------------------------------------- | ----------------------------------------- |
| Inject all dependencies through interfaces            | Create clients inside handlers            |
| Use factory functions (index.ts) to wire dependencies | Pass concrete implementations to handlers |
| Define dependency interfaces in handler files         | Use `any` or overly broad types           |

**✅ DO:**

```typescript
interface Dependencies {
  getRisk: (id: RiskId) => Promise<Risk>;
  saveRisk: (risk: Risk) => Promise<void>;
}

export const archiveRiskCommandHandler = (deps: Dependencies) => {
  // Use deps.getRisk, deps.saveRisk
};
```

**❌ DON'T:**

```typescript
export const archiveRisk = async (
  hasuraClient: ApolloClient,
  riskId: string
) => {
  const apiClient = getRisksmartApiClient(hasuraClient);
  // Direct usage of concrete implementations
};
```

### Business Logic

| ✅ DO                                        | ❌ DON'T                                    |
| -------------------------------------------- | ------------------------------------------- |
| Keep business logic in pure command handlers | Mix business logic with infrastructure code |
| Use domain entities with business rules      | Use raw GraphQL types directly              |
| Make business rules explicit and named       | Scatter validation logic across layers      |
| Return domain types from handlers            | Return GraphQL mutation results             |

**✅ DO:**

```typescript
export const canBeArchived = (risk: Risk): boolean => {
  return risk.status === 'active' && !risk.hasActiveControls;
};

export const asArchived = (risk: Risk, userId: string): ArchivedRisk => {
  if (!canBeArchived(risk)) {
    throw new Error('Risk cannot be archived');
  }
  return { ...risk, status: 'archived', archivedBy: userId };
};
```

**❌ DON'T:**

```typescript
export const archiveRisk = async (hasuraClient: any, riskId: string) => {
  const risk = await hasuraClient.query(GetRiskDocument, { id: riskId });

  // Business rule hidden in handler
  if (
    risk.Status === 'active' &&
    risk.controls.filter((c) => c.Status === 'active').length === 0
  ) {
    await hasuraClient.mutate(UpdateRiskDocument, {
      id: riskId,
      set: { Status: 'archived' },
    });
  }
};
```

### Type Safety

| ✅ DO                               | ❌ DON'T                                        |
| ----------------------------------- | ----------------------------------------------- |
| Use Zod schemas for validation      | Use TypeScript types without runtime validation |
| Use branded types for IDs           | Use plain strings for IDs                       |
| Define explicit command/query types | Use generic parameters e.g. any or unknown      |
| Make domain entities readonly       | Allow mutation of domain entities               |

**✅ DO:**

```typescript
export const riskIdSchema = z.string().uuid().brand('RiskId');
export type RiskId = z.infer<typeof riskIdSchema>;

export const riskSchema = z.object({
  id: riskIdSchema,
  title: z.string().min(1),
  status: z.enum(['active', 'archived']),
});

export type Risk = Readonly<z.infer<typeof riskSchema>>;
```

**❌ DON'T:**

```typescript
export type RiskId = string; // No brand, no validation

export interface Risk {
  id: string;
  title: string;
  status: string; // Not type-safe
}
```

### Error Handling

| ✅ DO                                            | ❌ DON'T                      |
| ------------------------------------------------ | ----------------------------- |
| Throw domain-specific errors with clear messages | Throw generic errors          |
| Validate in domain layer with explicit checks    | Let database errors bubble up |
| Use logger for context (appendKeys)              | Use console.log               |

**✅ DO:**

```typescript
const risk = await deps.getRisk(command.riskId);

if (!canBeArchived(risk)) {
  throw new Error(
    `Risk ${risk.id} cannot be archived: ${
      risk.hasActiveControls ? 'Archive controls first' : 'Risk is not active'
    }`
  );
}
```

**❌ DON'T:**

```typescript
try {
  const risk = await getRisk(riskId);
  // No validation, let database fail
  await updateRisk(riskId, { status: 'archived' });
} catch (e) {
  throw new Error('Failed to archive'); // No context
}
```

### Testing

| ✅ DO                               | ❌ DON'T                              |
| ----------------------------------- | ------------------------------------- |
| Test business logic with mocks      | Test with real database               |
| Test all business rule branches     | Only test happy path                  |
| Use builder patterns for test data  | Create test data inline               |
| Co-locate tests with implementation | Put all tests in separate test folder |

### Data Access

| ✅ DO                                      | ❌ DON'T                                 |
| ------------------------------------------ | ---------------------------------------- |
| Use adaptors for all external I/O          | Call GraphQL client directly in handlers |
| Transform data in adaptors to domain types | Return raw GraphQL types                 |
| Handle errors in adaptors                  | Let GraphQL errors propagate             |

**✅ DO:**

```typescript
// adaptors/risk-data-adaptor.ts
// ✅ DO: Define adaptor interface for swappable implementations
interface RiskDataAdaptor {
  getById: (id: RiskId) => Promise<Risk>;
}

export const createRiskDataAdaptor = (opts: ServiceOptions): RiskDataAdaptor => {
  const client = getHasuraBackendClient(opts);

  return {
    getById: async (id: RiskId): Promise<Risk> => {
      const result = await client.query({
        query: GetRiskDocument,
        variables: { id },
      });

      if (!result.data?.risk_by_pk) {
        throw new Error(`Risk not found: ${id}`);
      }

      return transformRiskFromData(result.data.risk_by_pk);
    },
  };
};
```

**❌ DON'T:**

```typescript
export const archiveRisk = async (
  hasuraClient: ApolloClient,
  riskId: string
) => {
  // Direct GraphQL call in business logic
  const result = await hasuraClient.query({
    query: GetRiskDocument,
    variables: { id: riskId },
  });

  // Use raw GraphQL type
  return result.data.risk_by_pk;
};
```

### Reusability

| ✅ DO                                        | ❌ DON'T                             |
| -------------------------------------------- | ------------------------------------ |
| Design handlers to work from any entry point | Couple to HTTP/EventBridge specifics |
| Extract session data in entry point          | Pass raw event objects to handlers   |

**✅ DO:**

```typescript
// Can be called from REST, EventBridge, CLI, scheduled jobs
// entry point
export const handler = singleEventBridgeHandler(async (event) => {
  const session = getSessionData(event.detail.event?.session_variables);
  // actual handler
  const handler = createArchiveRiskCommandHandler(session);

  await handler.execute({ riskId, archivedBy: session.userId });
});
```

**❌ DON'T:**

```typescript
// Tightly coupled to HTTP
export const handler = backendRouteHandler(schema, async (body) => {
  const hasuraClient = await getHasuraBackendClientForAction(body);

  // Can only be used from HTTP handler
  const result = await archiveRisk(hasuraClient, body.input.object.RiskId);

  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
});
```

---

## Migration Path

Use common sense. If it makes sense to migrate existing code to this new pattern when you're working in that space then you may do so. However, we are not making any active effort to migrate the existing code base to this new pattern. This new pattern should be followed when developing new features.

---

## Summary

### Key Takeaways

1. **Separate business logic from infrastructure** using dependency injection
2. **Use rich domain models** with explicit business rules
3. **Test business logic in isolation** with mocks
4. **Organize by feature/domain**, not by technical layer
5. **Make commands/queries explicit** with typed interfaces
6. **Transform data at boundaries** (adaptors)
7. **Keep handlers thin** - they should only orchestrate

### Quick Reference

**File Structure:**

```
services/
└── [domain]/
    ├── adaptors/                    # Infrastructure Layer (✅ Shared)
    │   ├── [domain]-db-adaptor/     # Database adaptor
    │   │   ├── adaptor.ts
    │   │   ├── transform.ts
    │   │   └── types.ts
    │   └── types.ts                 # Shared adaptor utilities
    │
    ├── domain/                      # Domain Layer (Business Logic)
    │   ├── types.ts                 # Domain models
    │   └── services/                # Domain services (optional)
    │       └── [service].ts
    │
    └── handlers/                    # Application Layer (Use Cases)
        └── [use-case]/
            ├── [use-case]-handler.ts
            ├── [use-case]-handler.test.ts
            └── index.ts             # Composition root (wires dependencies)
```

**Implementation Checklist:**

- [ ] Define domain entities with Zod schemas in `domain/types.ts`
- [ ] Extract business rules as pure functions in `domain/` or `domain/services/`
- [ ] Create command/query types in handler file
- [ ] Implement handler with dependency interfaces
- [ ] Write comprehensive unit tests
- [ ] Create adaptors for infrastructure
- [ ] Create factory to wire dependencies
- [ ] Update HTTP/EventBridge handler

---

## Further Reading

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

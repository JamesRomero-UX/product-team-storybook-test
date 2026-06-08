---
name: create-frontend-router
description: Create a new tRPC frontend router file and register it in the main router
argument-hint: <entityName> <serviceName> [procedures]
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

# Create Frontend tRPC Router

## Required Inputs

- **entityName**: The entity name in camelCase
  (e.g., `action`, `thirdParty`, `internalAuditReport`).
  Used for the router variable name and file name.
- **serviceName**: The service factory function name
  without the `create` prefix and `Service` suffix
  (e.g., `Action`, `Risk`, `ThirdParty`, `Policy`).
  This maps to `create{serviceName}Service` in the
  services index. If unknown, pass `?` and the skill
  will look it up.
- **procedures** (optional): Comma-separated list of
  procedure names to generate (e.g.,
  `register,getById,listByParentId`). If omitted, default
  to `register,getById`.

## Input Validation

1. Check that **entityName** is provided. If missing,
   STOP and tell the user:
   "Please provide the entity name in camelCase
   (e.g., action, thirdParty, internalAuditReport)."
2. Check that **serviceName** is provided. If missing,
   STOP and tell the user:
   "Please provide the service name in PascalCase used
   in the create{Name}Service factory (e.g., Action, Risk,
   ThirdParty). Pass ? to auto-detect."
3. If **serviceName** is `?`, read
   `packages/trpc/src/services/frontend/index.ts` and look
   for a factory function that matches the entity. If no
   match is found, STOP and ask the user to specify.

## Steps

### Step 1: Determine file naming and check for conflicts

Derive the kebab-case filename from the entityName by
inserting hyphens before uppercase letters and lowercasing
(e.g., `thirdParty` becomes `third-party`,
`internalAuditReport` becomes `internal-audit-report`).

The router file path is:
`packages/trpc/src/routers/frontend/{kebab-case}.router.ts`

Check if this file already exists. If it does, STOP and
inform the user. Ask whether they want to add procedures to
the existing file instead.

### Step 2: Verify the service factory exists

Read `packages/trpc/src/services/frontend/index.ts` and
confirm that `create{serviceName}Service` is exported as a
function. Note the return type interface name (e.g.,
`RiskService`, `ActionService`).

If the factory does not exist, STOP and tell the user they
need to create the service first. The router depends on
having a corresponding service.

### Step 3: Check the service interface for available methods

Read `packages/trpc/src/services/service.types.ts` and find
the interface matching the service return type from Step 2.
List the available methods so you know what the router
procedures can call. Each router procedure is a thin wrapper
that delegates to a service method.

### Step 4: Determine the procedures to create

Based on **procedures** (or the default `register,getById`), plan
each procedure. For each procedure, identify:

- The procedure name (camelCase key in the router object)
- Whether it is a `.query()` or `.mutation()`
- The Zod input schema (if any)
- The service method it calls

Use these reference files for each procedure type:

- **register** (list all entities):
  `packages/trpc/src/routers/frontend/obligation.router.ts`
  lines 7-15 (simple register with no input)
  `packages/trpc/src/routers/frontend/action.router.ts`
  lines 7-28 (register with optional filter inputs)
- **getById / entityById** (fetch single entity):
  `packages/trpc/src/routers/frontend/obligation.router.ts`
  lines 16-29 (simple byId)
  `packages/trpc/src/routers/frontend/control.router.ts`
  lines 36-62 (byId with logger)
- **listByParentId** (fetch children of a parent):
  `packages/trpc/src/routers/frontend/indicator.router.ts`
  lines 54-71 (indicators by parent)
- **insert** (create a new record):
  `packages/trpc/src/routers/frontend/indicator.router.ts`
  lines 73-120 (insert with complex Zod validation)
  `packages/trpc/src/routers/frontend/action.router.ts`
  lines 76-104 (insert within nested sub-router)
- **delete** (remove records):
  `packages/trpc/src/routers/frontend/action.router.ts`
  lines 105-126 (batch delete with id array)
- **nested sub-router** (group related procedures):
  `packages/trpc/src/routers/frontend/action.router.ts`
  lines 47-126 (updates sub-router as plain object)
  `packages/trpc/src/routers/frontend/assessment.router.ts`
  lines 38-53 (resultParents sub-router)

### Step 5: Create the router file

Create the file at the path from Step 1 following these
conventions observed across all existing routers:

**Import structure** (order matters):

1. External type imports (if needed, e.g., domain types)
2. `import { z } from 'zod';` (only if any procedure has
   input validation)
3. `import { authedProcedure, router } from '../../init';`
4. Service factory import:
   `import { create{serviceName}Service } from '../../services/frontend/index';`
5. Optional: `import { logger } from '../../utils/logger';`
   (only include if the router uses logging)

**Router structure:**

```typescript
export const {entityName}Router = router({
  // procedures go here
});
```

**Procedure pattern** - every procedure follows this shape:

```typescript
procedureName: authedProcedure
  .input(z.object({ /* zod schema */ }))  // optional
  .query(async (req) => {                 // or .mutation
    const service = create{serviceName}Service();

    return service.methodName(
      {
        orgId: req.ctx.user.orgId,
        tenant: req.ctx.user.tenant,
        userId: req.ctx.user.userId,
      },
      // additional arguments from req.input
    );
  }),
```

Key conventions from the existing codebase:

- The callback parameter is always named `req` (not `opts`
  or `ctx`)
- The service context object is always constructed inline
  with `orgId`, `tenant`, `userId` from `req.ctx.user`
- The service is instantiated inside each procedure call
  via the factory function, not shared across procedures
- Queries use `.query()`, mutations use `.mutation()`
- Input schemas use `z.object({...})` with Zod
- UUID fields use `z.string().uuid()`
- Optional fields use `.optional()`
- Nullable fields use `.nullable().optional()`
- The `CustomAttributeData` field pattern is:
  `z.record(z.string(), z.unknown()).nullable().optional()`
- Batch delete inputs use:
  `z.array(z.string().uuid()).min(1).max(200)`
- Nested sub-routers are plain objects (not `router()`
  calls), just object literals with procedures as values
- Logging is optional; only some routers use it. If
  included, log before the service call with structured
  context.

### Step 6: Register the router in the main router file

Read `packages/trpc/src/routers/router.ts` and add:

1. An import statement for the new router, inserted in
   **alphabetical order** among the existing frontend
   router imports (lines 19-65 of the file). Follow the
   existing naming pattern:
   `import { {entityName}Router } from './frontend/{kebab-case}.router';`

2. A key-value entry in the `frontend` object of the
   `appRouter` (lines 93-141), inserted in **alphabetical
   order** by key name:
   `{entityName}: {entityName}Router,`

Reference
`packages/trpc/src/routers/router.ts`
for the exact structure of imports and the frontend object.

## Error Recovery

**If service import fails:**

- Verify the service is exported from
  `packages/trpc/src/services/frontend/index.ts`
- STOP and tell the user: "Service not exported from
  index.ts. Create the service first."

**If router already has the same procedure name:**

- Do not overwrite the existing procedure
- STOP and tell the user: "Procedure '{name}' already
  exists in the router."

**If router.ts import path fails:**

- Verify the router file path matches the kebab-case
  convention: `{kebab-case}.router.ts`
- Check the import uses the correct relative path from
  `router.ts`

## Verification

1. **File exists**: The router file was created at
   `packages/trpc/src/routers/frontend/{kebab-case}.router.ts`
2. **Import from init**: The file imports
   `authedProcedure` and `router` from `'../../init'`
3. **Service factory**: The file imports the correct
   `create{serviceName}Service` from
   `'../../services/frontend/index'`
4. **Zod import**: If any procedure has `.input()`, then
   `z` is imported from `'zod'`. If no procedure has
   input, `z` is NOT imported.
5. **Export name**: The router is exported as
   `const {entityName}Router`
6. **Router wrapper**: The export uses `router({...})` to
   wrap the procedures
7. **Procedure shape**: Every procedure uses
   `authedProcedure`, constructs the service context from
   `req.ctx.user`, and delegates to a service method
8. **Registered in main router**:
   `packages/trpc/src/routers/router.ts` has the import
   and the frontend entry, both in alphabetical order
9. **No type casting**: The file has zero instances of
   `as` type casting or `!` non-null assertions

---
name: create-zapier-trigger-action
description: Creates a new Zapier trigger or action with dynamic custom fields, linked item support, tests, and contract snapshot update. Reads the REST API schema to generate correct input/output field definitions.
argument-hint: <trigger|action|search> <entity-name> (e.g., trigger risks, action create_risk)
allowed-tools: Read, Glob, Grep, Edit, Write, Bash
---

## Required Arguments

- `$1` (type): `trigger`, `action`, or `search`
- `$2` (name): kebab-case name (e.g., `new-risk`, `create-risk`, `find-control`)

## Steps

### 1. Read the REST API schema for this entity

Extract entity name from `$2` (e.g., `new-risk` → `risks`, `create-risk` → `risks`).

Read:
- `packages/external-api/src/schemas/{entity}/{entity}.schema.ts` — response shape
- `packages/external-api/src/schemas/{entity}/{entity}-mutate-request.schema.ts` — request shape (actions only)
- `packages/external-api/src/schemas/common/custom-fields.schema.ts` — custom field structure
- `packages/external-api/src/schemas/common/linked-item.schema.ts` — linked item structure

### 2. Check entity capabilities

Determine from the schema:
- Has custom fields? → Need dynamic `inputFields`/`outputFields`
- Has linked items? → Need compound "with links" variant for actions
- Has child resources? → List the available sub-routes (e.g., `/risks/:id/ratings`)

### 3. Generate static fields

Map the Zod schema fields to Zapier field definitions:

| Zod Type | Zapier Type |
|----------|-------------|
| `z.string()` | `{ type: 'string' }` |
| `z.string().min(1)` | `{ type: 'string', required: true }` |
| `z.number()` | `{ type: 'number' }` |
| `z.number().int()` | `{ type: 'integer' }` |
| `z.boolean()` | `{ type: 'boolean' }` |
| `isoDateTimeValue` | `{ type: 'datetime' }` |
| `z.string().nullable()` | `{ type: 'string', required: false }` |

### 4. Generate dynamic field loader (if custom fields)

If the entity has custom fields, create a dynamic field loader:
- Import `getCustomFields` from `src/fields/custom-fields.ts`
- Add as the last element in `inputFields` (actions) or `outputFields` (triggers)

### 5. Create the trigger/action/search file

In `packages/zapier-app/src/{type}s/{name}.ts`:
- Export using `satisfies Trigger`, `satisfies Create`, or `satisfies Search`
- Use `z.request()` for all API calls
- Include `risksmart_version` query param
- Include `sample` with realistic test data
- Type-check the `sample` object against the generated OpenAPI types:
  - Import the entity type from `src/types/api.ts` (e.g., `ApiResponse`, `ApiListItem`, `ApiSchema`)
  - Add `satisfies Partial<EntityType>` on the sample object
  - For list samples with `_zapierLabel`, use `satisfies Partial<T> & { _zapierLabel?: string }`
  - For delete actions, use `satisfies ApiSchema<'MutationResponse'>`

### 6. Register in index.ts

Add to the appropriate section in `packages/zapier-app/src/index.ts`.

### 7. Create test

In `packages/zapier-app/test/{type}s/{name}.test.ts`:
- Test happy path against local API
- Test with invalid API key (401)
- Test dynamic fields resolve correctly (if custom fields)

### 8. Update API contract snapshot

```bash
pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app
```

### 9. Run tests

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app
pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app
```

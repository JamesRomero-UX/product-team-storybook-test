---
name: register-data-layer-route
description: Register new HTTP routes in the data-layer handler for existing processors, including import statements and CDK API Gateway method verification.
argument-hint: <entity-name> <HTTP-methods> e.g. "risk-assessments POST,DELETE"
allowed-tools: Read, Glob, Grep, Edit, Bash
---

## Required Inputs

- **entityName**: Entity name in kebab-case (e.g.
  `risk-assessments`). This determines the route path
  and processor directory.
- **httpMethods**: Comma-separated HTTP methods to
  register (e.g. `POST,DELETE` or `GET,POST,PUT,DELETE`).

## Input Validation

1. Check that **entityName** is provided and is
   a non-empty kebab-case string.
2. Check that **httpMethods** is provided and
   contains only valid methods: GET, POST, PUT, DELETE.
3. If either input is missing or invalid, STOP and
   tell the user:
   "Please provide the entity name in kebab-case and
   a comma-separated list of HTTP methods
   (e.g. `risk-assessments POST,DELETE`)."

## Steps

### 1. Verify processors exist

Glob for processor files in
`services/data-layer/src/handlers/http/client/processors/{entityName}/`.

For each HTTP method in **httpMethods**, confirm the corresponding
processor file exists:

- GET -> look for `get-all.ts`, `get-by-id.ts`,
  `get-register.ts`, or `get-*.ts`
- POST -> `create.ts`
- PUT -> `update.ts`
- DELETE -> `delete.ts`

Also check whether the entity directory has an
`index.ts` barrel export file. This determines the
import style in step 2.

If a processor file does not exist for a requested
method, STOP and tell the user which processor is
missing.

### 2. Add import statements to client/handler.ts

Read
`services/data-layer/src/handlers/http/client/handler.ts`.

Add import statements for each new processor. Follow
the existing import conventions visible in that file:

- **If the entity has an `index.ts` barrel file**,
  import from the directory
  (e.g. `./processors/form-fields`). Use a single
  import statement grouping all named exports.
- **If no barrel file exists**, import from the
  specific file
  (e.g. `./processors/action-updates/create`). Use
  one import per processor file.

Place new imports alphabetically among the existing
processor imports.

Determine the correct export name by reading the
processor file or index file to find the actual
exported function name. Do not guess -- use the real
export name from the source.

### 3. Add route entries to the routes array

Add route objects to the `routes` array in
`client/handler.ts`. Follow the file's existing structure
using comment blocks to group routes by entity:

```typescript
{
  method: '<METHOD>',
  path: '/<entity-path>',
  handler: <processorFunctionName>,
}
```

Reference existing routes in `client/handler.ts` for the
exact formatting and path patterns:

- Collection endpoints: `/<entity-name>`
  (e.g. `/action-updates`)
- Single-resource endpoints: `/<entity-name>/{id}`
  (e.g. `/control-groups/{id}`)
- Nested endpoints:
  `/<entity-name>/by-parent/{parentId}`

Match the path style to what the processor expects.
Read the processor file to check if it parses path
parameters (look for `pathParameters` or
`pathParamsSchema`) to determine whether the route
needs `{id}` or similar path params.

### 4. Verify CDK API Gateway configuration

Read `cdk-stack/lib/dataLayerStack.ts`.

There are two API Gateways defined in this file, each
with its own Lambda function:

- **Internal API** (`createRestApiGateway` method):
  Serves the `internal/handler.ts` Lambda. Uses
  explicit per-resource method definitions for
  backend-to-backend (permissions service) routes.
- **Client API** (`createClientApiGateway` method):
  Serves the `client/handler.ts` Lambda. Uses a
  greedy `{proxy+}` resource. Check that
  `proxyResource.addMethod('<METHOD>', ...)` exists
  for each HTTP method being registered.

For the **client API**, verify each method in **httpMethods**
already has an `addMethod` call on the proxy resource.
Currently GET, POST, PUT, and DELETE are all defined.
If a method is missing, add it following the existing
pattern and note that CDK redeployment is required.

**Why this matters**: API Gateway returns a 403
"Missing Authentication Token" error if a method is
not configured on the proxy resource, even if the
Lambda handler has the route defined. This is a common
source of misleading runtime errors that won't be
caught by TypeScript or tests.

For the **internal API**, only add explicit resource
definitions if the new route is intended for
backend-to-backend use. Most new routes only need the
client API (proxy). If internal API registration is
needed, follow the existing pattern of
`api.root.addResource('<path>')` then
`.addMethod('<METHOD>', integration)`.

## Verification

1. **Imports resolve**: Every handler referenced in
   the routes array has a corresponding import
   statement at the top of `client/handler.ts`.
2. **Route structure**: Each new route object has
   exactly three properties: `method`, `path`, and
   `handler`. No extra or missing properties.
3. **No duplicates**: The new routes do not duplicate
   any existing route (same method + path
   combination).
4. **CDK methods**: The client API Gateway in
   `dataLayerStack.ts` has `addMethod` calls for
   every HTTP method used by the new routes.

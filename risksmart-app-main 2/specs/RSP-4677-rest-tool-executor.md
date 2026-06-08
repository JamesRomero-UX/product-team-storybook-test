# RSP-4677: External API REST Tool Executor

**Linear issue**: [RSP-4677](https://linear.app/risksmart/issue/RSP-4677/external-api-rest-tool-executor)
**Status**: Spec
**Blocked by**: RSP-4676 (credential token provider)

## Overview

Replace the stub `executeRestTool` in `packages/mcp-server/src/tools/rest-executor.ts` with a real implementation that calls the External API (REST) for all 15 REST-available MCP tools when the session uses client-credential authentication (Cognito JWT).

The executor must:
- Map tool procedure paths to REST endpoint URLs
- Forward the Cognito JWT as `Authorization: Bearer <token>`
- Unwrap the External API's `{ data, pageInfo }` envelope to return flat JSON matching the tRPC executor's output
- Auto-paginate list endpoints (fetch all pages)
- Handle the 3 OAuth-only tools (already gated by executor-factory)

## Technical Approach

### Architecture

No new files beyond replacing the stub. The executor-factory routing (`executor-factory.ts`) already dispatches `session.authType === 'credentials'` to `executeRestTool` — no changes needed there.

```
executeToolForSession()
  ├─ oauth-only check (already exists)
  ├─ OAuth → executeTrpcTool() (unchanged)
  └─ Credentials → executeRestTool() ← THIS SPEC
                      ├─ endpointMap lookup
                      ├─ URL construction (path params from input)
                      ├─ fetch() with Bearer token
                      ├─ response normalisation (unwrap envelope)
                      └─ auto-pagination (follow nextPage)
```

### Endpoint Mapping

A static `endpointMap` maps `procedurePath` to REST endpoint config:

```typescript
interface RestEndpoint {
  path: string;           // URL path template, e.g. '/api/v1/risks/:riskId'
  type: 'list' | 'item' | 'linked-items';
  /** Input params that have no REST query equivalent — will be noted in response */
  unsupportedFilters?: string[];
}

const endpointMap: Record<string, RestEndpoint> = {
  // Risks
  'frontend.risk.register':    { path: '/api/v1/risks', type: 'list' },
  'frontend.risk.riskById':    { path: '/api/v1/risks/:riskId', type: 'item' },

  // Controls
  'frontend.control.register':    { path: '/api/v1/controls', type: 'list', unsupportedFilters: ['parentId'] },
  'frontend.control.controlById': { path: '/api/v1/controls/:controlId', type: 'item' },

  // Actions
  'frontend.action.register':    { path: '/api/v1/actions', type: 'list', unsupportedFilters: ['parentId', 'tagTypeIds', 'departmentTypeIds'] },
  'frontend.action.actionById':  { path: '/api/v1/actions/:id', type: 'item' },

  // Issues
  'frontend.issue.register':    { path: '/api/v1/issues', type: 'list', unsupportedFilters: ['issueType', 'tagTypeIds', 'departmentTypeIds'] },
  'frontend.issue.issueById':   { path: '/api/v1/issues/:id', type: 'item' },

  // Obligations
  'frontend.obligation.register': { path: '/api/v1/compliance/obligations', type: 'list' },

  // Third Parties
  'frontend.thirdParty.register': { path: '/api/v1/third-parties', type: 'list' },

  // Enterprise Risks
  'frontend.enterpriseRisk.register': { path: '/api/v1/enterprise-risks', type: 'list' },

  // Indicators
  'frontend.indicator.register': { path: '/api/v1/indicators', type: 'list' },

  // Documents (REST uses "policies", tRPC uses "documents")
  'frontend.document.register': { path: '/api/v1/policies', type: 'list' },

  // Assessments
  'frontend.assessment.register': { path: '/api/v1/assessments', type: 'list' },

  // Linked Items (entity-scoped in REST)
  'frontend.linkedItem.linkedItems': { path: '/api/v1/:entityType/:id/linked-items', type: 'linked-items' },
};
```

### URL Construction

Path parameters (`:riskId`, `:id`, `:entityType`) are substituted from the tool's `input` object:

```typescript
const buildUrl = (baseUrl: string, endpoint: RestEndpoint, input: Record<string, unknown>): string => {
  let path = endpoint.path;
  // Replace :param placeholders with input values
  for (const [key, value] of Object.entries(input)) {
    path = path.replace(`:${key}`, encodeURIComponent(String(value)));
  }
  // For list endpoints, set page_size=250 (max) to minimise page count
  if (endpoint.type === 'list' || endpoint.type === 'linked-items') {
    path += '?page_size=250';
  }
  return `${baseUrl}${path}`;
};
```

### Response Normalisation

The External API and tRPC return different shapes. The REST executor must normalise to match tRPC output:

| Endpoint Type | External API Response | tRPC Response | Normalisation |
|---|---|---|---|
| **List** (`GET /risks`) | `{ data: [...], pageInfo: {...} }` | `[...]` (flat array) | Unwrap `data` field, discard `pageInfo` |
| **Get by ID** (`GET /risks/:id`) | `{ id, title, ... }` (flat object) | `[{ id, title, ... }]` (one-element array) | Wrap in array: `[response]` |
| **Linked items** (`GET /:entity/:id/linked-items`) | `{ data: [...], pageInfo: {...} }` | `[...]` (flat array with polymorphic `target_*` fields) | Unwrap `data` field. Note: REST linked-item shape differs from tRPC — REST returns `{ id, linkedItemId, linkedItemType, ... }` while tRPC returns rich polymorphic objects. Return REST shape as-is (it's still useful). |

### Auto-Pagination

For `list` and `linked-items` endpoints, fetch all pages:

```typescript
const MAX_PAGES = 50;

const fetchAllPages = async (
  initialUrl: string,
  headers: Record<string, string>,
  baseUrl: string
): Promise<unknown[]> => {
  const allItems: unknown[] = [];
  let url: string | null = initialUrl;
  let pageCount = 0;

  while (url && pageCount < MAX_PAGES) {
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!response.ok) throw new RestApiError(response);

    const body = await response.json() as { data: unknown[]; pageInfo: { nextPage: string | null; hasMore: boolean } };
    allItems.push(...body.data);
    pageCount++;

    // nextPage is a relative URL like "/api/v1/risks?page_size=250&start_after=..."
    // It includes page_size because we set it on the initial request
    url = body.pageInfo.nextPage ? `${baseUrl}${body.pageInfo.nextPage}` : null;
  }

  return allItems;
};
```

Key details:
- Initial request sets `page_size=250` (max) to minimise round-trips
- `nextPage` is a relative URL — prepend `EXTERNAL_API_BASE_URL`
- `nextPage` is only populated when `page_size` was set in the request (which we always do)
- Safety cap at 50 pages (12,500 items max) to prevent runaway pagination
- If cap is hit, log a warning but return what we have

### Filter Limitation Handling

When the tool input contains filters that have no REST equivalent (defined in `unsupportedFilters`), append a `_meta` object to the response:

```typescript
// For list endpoints with unsupported filters applied
{
  // ... normal array of items ...
}
// Becomes a wrapper when filters are present:
{
  items: [...],
  _meta: {
    filtersIgnored: ['parentId'],
    note: 'The following filters are not supported via API key authentication and were ignored: parentId. Results are unfiltered. Connect via OAuth for full filter support.'
  }
}
```

Wait — this changes the response shape from a flat array. Better approach: since the output is a JSON string consumed by AI clients, we can return the array with a top-level comment. Actually, the simplest approach: return the flat array (matching tRPC) and log the filter limitation. The AI client doesn't need metadata — the tool descriptions already document what filters are available.

**Revised approach**: Log a warning when unsupported filters are provided. Return the unfiltered results as a flat array (same shape as tRPC). No response mutation needed.

### `get_linked_items` Entity Type

Add an optional `entityType` parameter to the `get_linked_items` tool definition in `registry.ts`:

```typescript
{
  name: 'get_linked_items',
  description:
    'Get all items linked to a given item by its ID. Returns cross-referenced risks, controls, actions, and other linked entities. When using API key authentication, entityType is required.',
  procedurePath: 'frontend.linkedItem.linkedItems',
  parameters: z.object({
    id: z.string().uuid().describe('The unique identifier of the item'),
    entityType: z
      .enum(['risks', 'controls', 'actions', 'issues', 'indicators', 'policies', 'compliance/obligations', 'third-parties'])
      .optional()
      .describe('The entity type of the item (required for API key auth). E.g. "risks", "controls", "actions"'),
  }),
  availableVia: 'all',
}
```

- tRPC executor: ignores `entityType` (tRPC procedure only uses `id`)
- REST executor: requires `entityType` to build URL. Returns error if missing.

### Error Handling

Map External API errors to MCP-friendly strings:

```typescript
// External API error shape
interface RestApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

// Map to user-friendly messages
const mapRestError = (status: number, body: RestApiErrorBody): string => {
  switch (status) {
    case 400: return `Invalid request: ${body.error.message}`;
    case 401: return 'Authentication failed. The API credentials may be invalid or expired.';
    case 403: return 'Access denied. The API credentials do not have permission to access this resource.';
    case 404: return `Not found: ${body.error.message}`;
    case 429: return 'Rate limit exceeded. Please try again later.';
    default:  return `External API error (${status}): ${body.error.message}`;
  }
};
```

Errors are returned as JSON strings (not thrown), matching the pattern in the stub. The executor-factory and FastMCP framework expect string returns.

## Quality Considerations

### Security
- No new secrets — reuses `session.accessToken` (Cognito JWT) from credential token provider
- Bearer token forwarded over HTTPS only (`EXTERNAL_API_BASE_URL` enforces HTTPS in production)
- Input params are URL-encoded to prevent path injection
- No user input is interpolated into query strings beyond path params already validated by Zod

### Performance
- `page_size=250` minimises round-trips (1 request per 250 items)
- 50-page safety cap prevents unbounded fetching
- `AbortSignal.timeout(30_000)` on each fetch prevents hung connections
- Sequential pagination (not parallel) — simple and avoids rate limiting

### Observability
- Log tool name + endpoint path at info level for each call
- Log pagination progress (page count, total items) at debug level
- Log unsupported filter warnings at warn level
- Log errors with status code and response body at error level

## Reuse Targets

| What | Where | How Used |
|------|-------|----------|
| `ToolExecutor` type | `src/tools/types.ts` | REST executor implements this interface |
| `getEnv()` / `getOptionalEnv()` | `src/utils/environment.ts` | Read `EXTERNAL_API_BASE_URL` |
| `logger` | `src/utils/logger.ts` | Structured logging (pino) |
| `McpSession` type | `src/auth/authenticate.ts` | Session union type for auth context |
| `ToolDefinition` type | `src/tools/registry.ts` | Tool config including `procedurePath` |
| `executeTrpcTool` patterns | `src/tools/tool-executor.ts` | Template for fetch + auth header + timeout + error handling |
| Test patterns | `src/tests/rest-executor.test.ts`, `src/tests/tool-executor.test.ts` | Mock structure, session fixtures, assertion patterns |

## API Changes

### Modified Tool Definition

**`get_linked_items`** — add optional `entityType` parameter:

```
Before: { id: string }
After:  { id: string; entityType?: 'risks' | 'controls' | 'actions' | 'issues' | 'indicators' | 'policies' | 'compliance/obligations' | 'third-parties' }
```

This is additive and backwards-compatible. OAuth clients can continue to omit it.

### No New Endpoints

The REST executor calls existing External API endpoints. No API changes needed.

## Data Model Changes

None.

## UI Changes

None. This is a backend-only change in the MCP server.

## Testing Strategy

### Unit Tests (vitest, mocked fetch)

All tests in `packages/mcp-server/src/tests/rest-executor.test.ts`.

**1. Endpoint mapping (15 tests)**
For each REST-available tool:
- Mock `fetch` to return appropriate response shape
- Call `executeRestTool` with tool definition + input
- Assert correct URL was constructed
- Assert response is normalised to flat JSON string

**2. Pagination (3 tests)**
- Single page (hasMore: false) — returns data array
- Multi-page (3 pages) — follows nextPage, concatenates data
- Max page cap (50) — stops at limit, returns partial results

**3. Get-by-ID normalisation (2 tests)**
- Successful response — flat object wrapped in array `[entity]`
- 404 response — returns error message string

**4. `get_linked_items` entity type (3 tests)**
- With `entityType` — correct URL built
- Without `entityType` — returns error message
- Invalid `entityType` — Zod validation catches (handled at tool registration level)

**5. Error handling (4 tests)**
- 401 → auth error message
- 403 → permission error message
- 404 → not found message
- 500 → generic error message

**6. Filter warnings (2 tests)**
- Tool with unsupported filters in input — log warning, return unfiltered results
- Tool with no unsupported filters — no warning logged

**7. Auth header (1 test)**
- Verify `Authorization: Bearer <session.accessToken>` sent on every request

**8. Missing endpoint mapping (1 test)**
- Unknown `procedurePath` → returns error message

### Test Fixtures

```typescript
// Reuse existing session fixtures from executor-factory.test.ts
const credentialSession: McpSession = {
  authType: 'credentials',
  orgId: 'org_123',
  tenant: 'testtenant',
  accessToken: 'cognito-jwt-token',
};

// Mock External API responses
const mockListResponse = {
  data: [{ id: '1', title: 'Risk A' }, { id: '2', title: 'Risk B' }],
  pageInfo: { count: 2, hasMore: false, nextPage: null, prevPage: null, beforeCursor: null, afterCursor: null },
};

const mockItemResponse = { id: '1', title: 'Risk A', description: 'Details' };
```

## Rollout Plan

1. **No feature flags needed** — credential auth path is already gated by `EXTERNAL_API_BASE_URL` env var. If not set, credential auth is disabled entirely.
2. **Backwards compatible** — the only tool definition change (adding optional `entityType` to `get_linked_items`) is additive.
3. **No migrations** — no data model changes.
4. **Deployment**: Deploy MCP server with `EXTERNAL_API_BASE_URL` pointing to the External API. Credential sessions will immediately start using the REST executor.

## Task List

### Task 1: Endpoint mapping config (S)
**File**: `packages/mcp-server/src/tools/rest-executor.ts`

Create the `RestEndpoint` interface and `endpointMap` constant with all 15 tool mappings. Include `unsupportedFilters` arrays.

**Reuse**: `ToolDefinition.procedurePath` values from `registry.ts` as map keys.

### Task 2: URL builder (S)
**File**: `packages/mcp-server/src/tools/rest-executor.ts`

Implement `buildRestUrl()` that substitutes `:param` placeholders from input and appends `page_size=250` for list endpoints.

**Reuse**: `getEnv('EXTERNAL_API_BASE_URL')` from `environment.ts` (note: use `getEnv` not `getOptionalEnv` — by the time the REST executor runs, the env var must exist since the credential path was enabled).

### Task 3: Pagination helper (S)
**File**: `packages/mcp-server/src/tools/rest-executor.ts`

Implement `fetchAllPages()` that follows `nextPage` URLs up to `MAX_PAGES` limit.

**Reuse**: `AbortSignal.timeout()` pattern from `tool-executor.ts`.

### Task 4: Response normalisation (S)
**File**: `packages/mcp-server/src/tools/rest-executor.ts`

- List endpoints: return `data` array from envelope
- Get-by-ID endpoints: wrap single object in array `[entity]`
- Linked items: return `data` array from envelope

### Task 5: Error mapping (S)
**File**: `packages/mcp-server/src/tools/rest-executor.ts`

Implement `mapRestError()` and integrate into the executor. Return error strings (don't throw).

**Reuse**: Error handling pattern from `tool-executor.ts` (try/catch → formatted string).

### Task 6: Main executor implementation (M)
**File**: `packages/mcp-server/src/tools/rest-executor.ts`

Replace the stub `executeRestTool` with the real implementation that ties together tasks 1-5:
1. Look up endpoint from `endpointMap`
2. Validate required params (e.g. `entityType` for linked items)
3. Build URL
4. Log unsupported filter warnings
5. Fetch (with pagination for list endpoints)
6. Normalise response
7. Return JSON string

**Reuse**: `ToolExecutor` type from `types.ts`, `logger` from `utils/logger.ts`.

### Task 7: Update `get_linked_items` tool definition (S)
**File**: `packages/mcp-server/src/tools/registry.ts`

Add optional `entityType` parameter to the `get_linked_items` tool definition. Update the description to note it's required for API key auth.

### Task 8: Unit tests (M)
**File**: `packages/mcp-server/src/tests/rest-executor.test.ts`

Replace stub tests with comprehensive test suite covering all scenarios listed in Testing Strategy.

**Reuse**: Session fixtures and mock patterns from `executor-factory.test.ts` and `tool-executor.test.ts`.

### Task 9: Lint and type check (S)
Run `pnpm exec turbo lint --filter=@risksmart-app/mcp-server` and `pnpm exec turbo test:unit --filter=@risksmart-app/mcp-server` to verify.

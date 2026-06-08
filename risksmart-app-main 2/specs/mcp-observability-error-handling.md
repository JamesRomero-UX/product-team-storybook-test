# MCP Server Observability & Error Handling — Technical Spec

**Tickets**: [RSP-3725](https://linear.app/risksmart/issue/RSP-3725), [RSP-3728](https://linear.app/risksmart/issue/RSP-3728), [RSP-3726](https://linear.app/risksmart/issue/RSP-3726)
**Milestone**: M3 — Core Quality & Observability

## Overview

This spec covers three related tickets that bring production-grade observability and error handling to `packages/mcp-server`:

1. **RSP-3725** — Structured logging with correlation IDs and dd-trace integration
2. **RSP-3728** — Centralized error handling with MCP-format, AI-friendly responses
3. **RSP-3726** — Datadog APM custom spans, metrics, Error Tracking, dashboards, and alerts

RSP-3700 is a duplicate of RSP-3726 and should be closed.

## Technical Approach

### Stream 1: Structured Logging & Correlation IDs (RSP-3725)

#### 1.1 dd-trace SDK Integration

Add `dd-trace` to `package.json` (already in pnpm catalog at `5.85.0`). Create `src/utils/tracer.ts` following the `packages/external-api/src/utils/tracer.ts` pattern:

```typescript
// src/utils/tracer.ts
import tracer from 'dd-trace';

tracer.init({
  logInjection: true,
  service: process.env.DD_SERVICE,
  env: process.env.DD_ENV,
  version: process.env.DD_VERSION,
});

export default tracer;
```

**Critical**: `tracer.ts` must be imported as the **first line** in `src/app.ts`, before all other imports. dd-trace monkey-patches Node.js modules (http, fetch, etc.) at import time — if other modules import first, their HTTP calls won't be instrumented.

```typescript
// src/app.ts — BEFORE
import 'dotenv/config';
import { createServer } from './server';

// src/app.ts — AFTER
import './utils/tracer'; // Must be first
import 'dotenv/config';
import { createServer } from './server';
```

#### 1.2 Logger Enhancement

Update `src/utils/logger.ts` to inject `dd.trace_id` and `dd.span_id` into every log line via Pino's `mixin()` function. This is the pattern from `packages/external-api/src/utils/logger.ts`:

```typescript
// src/utils/logger.ts
import pino from 'pino';

import tracer from './tracer';

interface DatadogIds {
  'dd.trace_id'?: string;
  'dd.span_id'?: string;
}

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.DD_SERVICE || 'mcp-server',
    env: process.env.DD_ENV || 'development',
    version: process.env.DD_VERSION || 'unknown',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  mixin(): DatadogIds {
    const span = tracer.scope().active();
    if (!span) {
      return {};
    }
    const ctx = span.context();
    return {
      'dd.trace_id': ctx.toTraceId(),
      'dd.span_id': ctx.toSpanId(),
    };
  },
});

export type RequestLogger = pino.Logger;
```

#### 1.3 Correlation ID Middleware

Create `src/middleware/request-context.ts` — a Hono middleware that:
1. Generates a UUID correlation ID per request (or extracts from ALB's `x-amzn-trace-id` as a secondary reference)
2. Stores it in Hono's context via `c.set()`
3. Creates a child logger bound to the request
4. Sets `x-request-id` response header

```typescript
// src/middleware/request-context.ts
import { randomUUID } from 'node:crypto';
import type { Context, Next } from 'hono';

import { logger } from '../utils/logger';
import type { RequestLogger } from '../utils/logger';

export const REQUEST_LOGGER_KEY = 'requestLogger' as const;
export const CORRELATION_ID_KEY = 'correlationId' as const;

export const requestContextMiddleware = async (c: Context, next: Next) => {
  const correlationId = randomUUID();
  const method = c.req.method;
  const path = c.req.path;

  const requestLogger = logger.child({
    correlationId,
    method,
    path,
  });

  c.set(CORRELATION_ID_KEY, correlationId);
  c.set(REQUEST_LOGGER_KEY, requestLogger);
  c.header('x-request-id', correlationId);

  requestLogger.info('Incoming request');

  const startTime = Date.now();
  await next();
  const duration = Date.now() - startTime;

  requestLogger.info(
    { status: c.res.status, duration },
    'Response sent'
  );
};

/** Helper to retrieve the request-scoped logger from Hono context. */
export const getRequestLogger = (c: Context): RequestLogger =>
  (c.get(REQUEST_LOGGER_KEY) as RequestLogger) ?? logger;

/** Helper to retrieve the correlation ID from Hono context. */
export const getCorrelationId = (c: Context): string | undefined =>
  c.get(CORRELATION_ID_KEY) as string | undefined;
```

This replaces the existing inline middleware in `server.ts` (lines 85–91).

#### 1.4 Propagate Correlation ID to Downstream Calls

Both executors (`tool-executor.ts` and `rest-executor.ts`) make HTTP calls to backend services. These must forward the correlation ID via the `x-correlation-id` header.

**Challenge**: The executors don't have access to the Hono context — they receive `(toolDef, input, session)`. We need to thread the correlation ID through.

**Approach**: Extend `McpSession` with an optional `correlationId` field, set during authentication in `server.ts`, and read by executors.

```typescript
// In authenticate.ts — extend session types
export interface OAuthSession {
  // ... existing fields
  correlationId?: string;
}

export interface CredentialSession {
  // ... existing fields
  correlationId?: string;
}
```

In `server.ts`, after the auth middleware runs and before tool execution, the correlation ID is attached to the session. Since FastMCP's auth runs on the raw `IncomingMessage` (before Hono middleware), we'll set the correlation ID on the session in the tool execute callback where we have access to the Hono context's session object. Actually, FastMCP's `authenticate` returns the session which is then passed to `execute`. The correlation ID needs to be injected after the request context middleware runs.

**Revised approach**: Since FastMCP manages the session lifecycle, we'll use `node:async_hooks` AsyncLocalStorage to make the correlation ID available anywhere in the request chain without threading it through function arguments:

```typescript
// src/utils/request-store.ts
import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestStore {
  correlationId: string;
}

export const requestStore = new AsyncLocalStorage<RequestStore>();
```

The `requestContextMiddleware` wraps `next()` in `requestStore.run()`. Executors read the correlation ID via `requestStore.getStore()?.correlationId` and add it as a header on outbound HTTP calls.

**In `tool-executor.ts`**:
```typescript
headers: {
  authorization: `Bearer ${session.accessToken}`,
  'x-correlation-id': requestStore.getStore()?.correlationId ?? '',
},
```

**In `rest-executor.ts`**:
```typescript
const headers = {
  authorization: `Bearer ${session.accessToken}`,
  accept: 'application/json',
  'x-correlation-id': requestStore.getStore()?.correlationId ?? '',
};
```

#### 1.5 Replace Global Logger With Request-Scoped Logger

Currently all files import `logger` from `../utils/logger` and log without request context. After this change:

- **Middleware/route handlers** (have Hono `Context`): use `getRequestLogger(c)`
- **Executors** (no Hono context): use `requestStore` to get the correlation ID, then create a child logger or continue using the global logger (which already has trace IDs via mixin). The correlation ID will be in the logs via the child logger bound in middleware, and dd-trace's `logInjection` automatically correlates logs to traces.
- **Startup/shutdown code**: continue using global `logger` (no request context)

Files to update:
- `src/server.ts` — replace inline middleware with `requestContextMiddleware`, update logging in OAuth metadata handler, DCR route
- `src/tools/executor-factory.ts` — add correlation ID to error logs
- `src/tools/rest-executor.ts` — forward correlation ID header
- `src/tools/tool-executor.ts` — forward correlation ID header
- `src/auth/dcr-proxy.ts` — use request logger where Hono context is available
- `src/auth/module-checker.ts` — forward correlation ID header to tRPC call

---

### Stream 2: Graceful Error Responses (RSP-3728)

#### 2.1 Custom Exception Hierarchy

Create `src/errors/` directory with a typed exception hierarchy. All exceptions extend a base `McpError` class that carries structured metadata for both logging and client responses.

```typescript
// src/errors/mcp-error.ts
export interface McpErrorOptions {
  /** MCP error code (e.g. 'validation_error', 'auth_error') */
  code: string;
  /** User-friendly message safe to show to AI clients */
  message: string;
  /** HTTP status code */
  httpStatus: number;
  /** Optional context for the error (e.g. which parameter was invalid) */
  context?: Record<string, unknown>;
  /** Original error for logging (never exposed to client) */
  cause?: unknown;
}

export class McpError extends Error {
  readonly code: string;
  readonly httpStatus: number;
  readonly context?: Record<string, unknown>;

  constructor(options: McpErrorOptions) {
    super(options.message, { cause: options.cause });
    this.name = 'McpError';
    this.code = options.code;
    this.httpStatus = options.httpStatus;
    this.context = options.context;
  }

  /** Format for MCP client response — no internal details. */
  toMcpResponse(): { error: string; message: string; context?: Record<string, unknown> } {
    return {
      error: this.code,
      message: this.message,
      ...(this.context ? { context: this.context } : {}),
    };
  }
}
```

**Subclasses** (`src/errors/index.ts` re-exports all):

| Class | Code | HTTP | Usage |
|-------|------|------|-------|
| `ValidationError` | `validation_error` | 400 | Invalid input parameters |
| `AuthenticationError` | `auth_error` | 401 | Missing/invalid JWT, expired token |
| `AuthorizationError` | `authorization_error` | 403 | MCP not enabled, insufficient permissions |
| `NotFoundError` | `not_found` | 404 | Resource not found |
| `RateLimitError` | `rate_limit_exceeded` | 429 | DCR rate limit, API rate limit |
| `ExternalServiceError` | `external_service_error` | 502 | tRPC/REST API unreachable or erroring |
| `ToolExecutionError` | `tool_execution_error` | 500 | Unexpected error during tool execution |

Each subclass has a factory-style constructor for common cases:

```typescript
// src/errors/external-service-error.ts
export class ExternalServiceError extends McpError {
  constructor(service: string, message: string, cause?: unknown) {
    super({
      code: 'external_service_error',
      message: `${service} temporarily unavailable. ${message}`,
      httpStatus: 502,
      cause,
    });
    this.name = 'ExternalServiceError';
  }
}
```

#### 2.2 Error Handling Middleware

Create `src/middleware/error-handler.ts` — a Hono error handler that catches `McpError` instances and formats them for MCP clients:

```typescript
// src/middleware/error-handler.ts
import type { Context } from 'hono';

import { McpError } from '../errors/mcp-error';
import { getRequestLogger } from './request-context';

export const errorHandlerMiddleware = (err: Error, c: Context) => {
  const log = getRequestLogger(c);

  if (err instanceof McpError) {
    // 4xx = warn, 5xx = error
    if (err.httpStatus >= 500) {
      log.error({ err, code: err.code, context: err.context }, err.message);
    } else {
      log.warn({ code: err.code, context: err.context }, err.message);
    }

    return c.json(err.toMcpResponse(), err.httpStatus);
  }

  // Unhandled error — log full details, return generic message
  log.error({ err }, 'Unhandled error');
  return c.json(
    { error: 'internal_error', message: 'An unexpected error occurred. Please try again.' },
    500
  );
};
```

Register in `server.ts` via Hono's `app.onError(errorHandlerMiddleware)`.

#### 2.3 Refactor Existing Error Handling

**`executor-factory.ts`** — Replace ad-hoc JSON error returns with exception throws:

```typescript
// Before
if (!session.accessToken) {
  return JSON.stringify({ error: 'auth_error', message: '...' });
}

// After
if (!session.accessToken) {
  throw new AuthenticationError('No access token available for tool execution');
}
```

The catch block becomes:
```typescript
catch (error) {
  if (error instanceof McpError) throw error; // re-throw for middleware
  throw new ToolExecutionError(toolDef.name, error);
}
```

**`rest-executor.ts`** — Map `RestApiError` status codes to typed exceptions:

```typescript
// Before
return JSON.stringify({ error: 'api_error', message: formatRestError(...) });

// After
throw new ExternalServiceError('External API', formatRestError(error.status, error.body), error);
```

For missing parameters:
```typescript
throw new ValidationError(`Missing required parameter(s): ${missing}`, { parameters: missing.split(', ') });
```

**`tool-executor.ts`** — Wrap tRPC call failures:

```typescript
if (!response.ok) {
  throw new ExternalServiceError('tRPC service', `${response.status} ${response.statusText}`);
}
```

Input size limit:
```typescript
throw new ValidationError(`Input too large (${serialized.length} bytes, max ${MAX_INPUT_SIZE})`);
```

**`authenticate.ts`** — Replace `throw new Error(...)` with typed exceptions:

| Current | New |
|---------|-----|
| `throw new Error('Missing bearer token')` | `throw new AuthenticationError('Missing bearer token')` |
| `throw new Error('Invalid token')` | `throw new AuthenticationError('Invalid or malformed token')` |
| `throw new Error('Unknown issuer')` | `throw new AuthenticationError('Token issued by an unrecognised authority')` |
| `throw new Error('MCP not enabled...')` | `throw new AuthorizationError('MCP is not enabled for this organisation. Contact your admin to enable MCP in Settings → Modules.')` |
| `throw new Error('Missing org/tenant claims')` | `throw new AuthenticationError('Token is missing required organisation claims')` |

**`dcr-proxy.ts`** — Replace inline `c.json({ error: ... }, status)` with exception throws where practical. Some DCR responses are RFC 7591-mandated formats and should stay as-is; the error middleware will only catch unhandled exceptions.

#### 2.4 Sanitization

The `McpError.toMcpResponse()` method is the sanitization boundary — it only includes `code`, `message`, and optional `context` (no stack traces, no `cause`). The error handler middleware uses this method exclusively for client responses.

For extra safety, ensure:
- `ExternalServiceError` never includes raw response bodies in `message` — only the formatted user-friendly message from `formatRestError()`
- `cause` is only logged server-side, never serialised to the response
- Stack traces are omitted from all MCP error responses

---

### Stream 3: Datadog APM & Error Tracking (RSP-3726)

#### 3.1 Custom Spans for Tool Execution

Wrap `executeToolForSession()` in a manual dd-trace span to get per-tool tracing:

```typescript
// In executor-factory.ts
import tracer from '../utils/tracer';

export const executeToolForSession = async (
  toolDef: ToolDefinition,
  input: Record<string, unknown>,
  session: McpSession
): Promise<string> => {
  return tracer.trace('mcp.tool.execute', {
    resource: toolDef.name,
    tags: {
      'mcp.tool.name': toolDef.name,
      'mcp.auth.type': session.authType,
      'mcp.org.id': session.orgId,
      'mcp.tool.procedure': toolDef.procedurePath,
    },
  }, async (span) => {
    try {
      // ... existing routing logic
      const result = await executeTrpcTool(toolDef, input, session);
      span?.setTag('mcp.tool.result_size', result.length);
      return result;
    } catch (error) {
      span?.setTag('error', true);
      span?.setTag('error.type', error instanceof McpError ? error.code : 'unknown');
      throw error;
    }
  });
};
```

#### 3.2 Verify Auto-Instrumentation

dd-trace auto-instruments Node.js `fetch` (via `undici` in Node 18+) and `http`/`https` modules. Since the MCP server uses `fetch()` for all outbound calls, downstream HTTP calls to tRPC and External API should automatically appear as child spans.

**Verify by checking Datadog APM after deployment** — if spans are missing for outbound `fetch` calls, add manual instrumentation:

```typescript
return tracer.trace('mcp.http.trpc', { resource: procedurePath }, async () => {
  return fetch(url, { ... });
});
```

#### 3.3 Datadog Error Tracking

dd-trace with `logInjection: true` already correlates logs to traces. For Datadog Error Tracking to capture exceptions:

1. Set `span.setTag('error', true)` on spans where exceptions occur (done in 3.1)
2. Set `span.setTag('error.message', error.message)` and `span.setTag('error.stack', error.stack)` for unhandled errors
3. Use `tracer.trace()` error propagation — dd-trace automatically marks spans as errored when the traced function throws

The error handling middleware (Stream 2) should also report 5xx errors to Datadog:

```typescript
// In error-handler.ts, for 5xx errors:
const span = tracer.scope().active();
if (span && err.httpStatus >= 500) {
  span.setTag('error', true);
  span.setTag('error.message', err.message);
  span.setTag('error.type', err.code);
}
```

#### 3.4 Custom Metrics

Emit metrics via `tracer.dogstatsd` (the DogStatsD client bundled with dd-trace):

```typescript
// src/utils/metrics.ts
import tracer from './tracer';

const stats = tracer.dogstatsd;

export const metrics = {
  toolExecuted: (toolName: string, authType: string, orgId: string, durationMs: number) => {
    const tags = [`tool:${toolName}`, `auth_type:${authType}`, `org:${orgId}`];
    stats.increment('mcp.tool.executed', 1, tags);
    stats.histogram('mcp.tool.duration_ms', durationMs, tags);
  },

  toolError: (toolName: string, errorCode: string, authType: string) => {
    stats.increment('mcp.tool.error', 1, [
      `tool:${toolName}`,
      `error_code:${errorCode}`,
      `auth_type:${authType}`,
    ]);
  },

  authSuccess: (authType: string) => {
    stats.increment('mcp.auth.success', 1, [`auth_type:${authType}`]);
  },

  authFailure: (authType: string, reason: string) => {
    stats.increment('mcp.auth.failure', 1, [
      `auth_type:${authType}`,
      `reason:${reason}`,
    ]);
  },

  dcrRequest: (outcome: 'created' | 'existing' | 'error') => {
    stats.increment('mcp.dcr.request', 1, [`outcome:${outcome}`]);
  },
};
```

**Emit points**:
- `executor-factory.ts` → `metrics.toolExecuted()` after successful execution, `metrics.toolError()` on failure
- `authenticate.ts` → `metrics.authSuccess()` on session creation, `metrics.authFailure()` on rejection
- `dcr-proxy.ts` → `metrics.dcrRequest()` on completion

#### 3.5 Dashboards & Alerts

These are Datadog UI configuration tasks, not code changes. Document the expected dashboard widgets and alert conditions:

**Dashboard: "MCP Server"**

| Widget | Metric/Query | Viz |
|--------|-------------|-----|
| Tool Execution Rate | `sum:mcp.tool.executed{*} by {tool}` | Timeseries |
| Tool Latency (p50/p95/p99) | `p50/p95/p99:mcp.tool.duration_ms{*} by {tool}` | Timeseries |
| Error Rate | `sum:mcp.tool.error{*} by {tool,error_code}` | Timeseries |
| Auth Success/Failure | `sum:mcp.auth.success{*}, sum:mcp.auth.failure{*}` | Timeseries |
| Auth by Type | `sum:mcp.auth.success{*} by {auth_type}` | Pie chart |
| DCR Outcomes | `sum:mcp.dcr.request{*} by {outcome}` | Timeseries |
| Top Errors | Error Tracking → `service:mcp-server` | List |

**Alerts**:

| Alert | Condition | Window | Severity |
|-------|-----------|--------|----------|
| High Error Rate | `mcp.tool.error / mcp.tool.executed > 0.05` | 5 min | P2 |
| Latency Degradation | `p99:mcp.tool.duration_ms > 5000` | 5 min | P3 |
| Auth Failure Spike | `mcp.auth.failure > 20` | 15 min | P2 |
| Zero Traffic | `mcp.tool.executed == 0` (during business hours) | 30 min | P3 |

---

## Quality Considerations

### Security
- Correlation IDs are generated server-side using `crypto.randomUUID()` — never trusted from client headers
- Error responses stripped of stack traces, internal paths, and raw error bodies via the `McpError.toMcpResponse()` boundary
- No secrets or sensitive config values in error messages or span tags
- `orgId` in span tags is acceptable as it's non-sensitive metadata already visible in logs

### Performance
- dd-trace adds ~10-20ms cold start overhead on first import (acceptable for long-running ECS container)
- Pino `mixin()` for trace ID injection: ~0.01ms per log call (negligible)
- `AsyncLocalStorage` for correlation ID propagation: ~0.005ms per read (negligible)
- Custom metrics via DogStatsD are fire-and-forget UDP — zero latency impact
- No additional HTTP calls introduced — metrics/traces flow to the Datadog agent sidecar over localhost

### Testing
- Exception classes: unit test `toMcpResponse()` output and inheritance
- Error middleware: unit test with mock Hono context for each exception type
- Correlation ID: unit test middleware sets header and creates child logger
- Executor refactors: existing tests in `src/tests/executor-factory.test.ts`, `rest-executor.test.ts`, `tool-executor.test.ts` must be updated to expect thrown exceptions instead of JSON error strings
- Metrics: unit test with mocked `tracer.dogstatsd` to verify correct metric names and tags
- Integration: manual verification in staging that traces appear in Datadog APM and errors in Error Tracking

### Architecture
- Uses Hono middleware pattern (consistent with FastMCP's internal middleware)
- `AsyncLocalStorage` for request context (Node.js standard, zero external deps)
- Custom exception hierarchy (simple inheritance, easy to extend)
- Metrics utility is a thin wrapper over `tracer.dogstatsd` — no abstraction overhead

---

## Reuse Targets

| Pattern | Source | How to Reuse |
|---------|--------|-------------|
| dd-trace init | `packages/external-api/src/utils/tracer.ts` | Copy verbatim — identical config |
| Pino mixin with trace IDs | `packages/external-api/src/utils/logger.ts` | Copy `mixin()` function and `DatadogIds` type |
| Request ID generation | `packages/external-api/src/utils/logger.ts` (`generateRequestId`) | Use `crypto.randomUUID()` directly (no uuid dep needed) |
| Child logger per request | `packages/external-api/src/utils/logger.ts` (`createRequestLogger`) | Adapt pattern for Hono context instead of Express `req` |
| Datadog env vars | `cdk-stack/lib/datadog.ts` (`getDatadogEnvVars`) | Already configured for MCP server in CDK |
| Datadog agent sidecar | `cdk-stack/lib/datadog.ts` (`addDatadogAgent`) | Already deployed in MCP ECS task |
| `RestApiError` class | `packages/mcp-server/src/tools/rest-executor.ts` | Refactor into `ExternalServiceError` in the new hierarchy |
| `formatRestError()` | `packages/mcp-server/src/tools/rest-executor.ts` | Keep as-is, used by `ExternalServiceError` for user-friendly messages |

---

## API Changes

No external API changes. The MCP tool response format is unchanged — tools still return JSON strings. The only observable changes for clients:

1. **Error responses** become more consistent and actionable (structured `{ error, message, context? }` format)
2. **`x-request-id` response header** added to all HTTP responses
3. **Correlation ID** propagated to downstream services via `x-correlation-id` header

---

## Data Model Changes

None.

---

## UI Changes

None.

---

## Testing Strategy

### Unit Tests (all in `packages/mcp-server/src/tests/`)

| Test File | What to Test |
|-----------|-------------|
| `errors.test.ts` (new) | Each exception class: constructor, `toMcpResponse()`, inheritance chain, context serialization |
| `error-handler.test.ts` (new) | Middleware catches `McpError` → correct status + JSON; unhandled `Error` → 500; 4xx logs as warn, 5xx logs as error |
| `request-context.test.ts` (new) | Middleware generates UUID, sets response header, creates child logger, `AsyncLocalStorage` propagation |
| `metrics.test.ts` (new) | Each metric function calls `dogstatsd.increment`/`histogram` with correct names and tags |
| `executor-factory.test.ts` (update) | Update assertions: throws `AuthenticationError` instead of returning JSON; throws `ToolExecutionError` on unexpected error |
| `rest-executor.test.ts` (update) | Throws `ExternalServiceError` for API errors; throws `ValidationError` for missing params; includes `x-correlation-id` header in outbound calls |
| `tool-executor.test.ts` (update) | Throws `ExternalServiceError` for failed tRPC calls; throws `ValidationError` for oversized input; includes `x-correlation-id` header |
| `authenticate.test.ts` (update) | Throws `AuthenticationError` / `AuthorizationError` instead of generic `Error` |

### Integration Testing

- Deploy to `dev-cloud` environment and verify:
  - APM traces visible in Datadog for tool execution flow
  - Correlation IDs match across MCP server logs and downstream tRPC logs
  - Error Tracking shows grouped exceptions with org context
  - Custom metrics appear in Datadog Metrics Explorer
- Manual test with Claude Desktop / MCP Inspector to verify error messages are user-friendly

---

## Rollout Plan

### Phase 1: RSP-3725 (Logging + Correlation IDs)
- Branch: `rsp-3725-implement-structured-logging-with-correlation-ids-for-mcp`
- No feature flag needed — logging changes are backwards-compatible
- dd-trace auto-instruments existing HTTP calls with zero config
- Deploy to dev-cloud → verify traces in Datadog → merge

### Phase 2: RSP-3728 (Error Handling) — parallel with Phase 1
- Branch: `rsp-3728-implement-graceful-ai-compatible-error-responses`
- No feature flag needed — error format changes are internal
- Existing tests must be updated to expect thrown exceptions
- Deploy to dev-cloud → verify error responses with MCP Inspector → merge

### Phase 3: RSP-3726 (APM + Error Tracking) — after Phases 1 & 2
- Branch: `rsp-3726-integrate-datadog-apm-and-sentry-for-observability`
- Depends on both previous branches being merged
- Custom spans + metrics + dashboard + alerts
- Deploy to dev-cloud → configure dashboard and alerts in Datadog UI → merge

### Backwards Compatibility
- No breaking changes to MCP protocol or tool responses
- Error response format changes from ad-hoc `{ error, message }` to consistent `{ error, message, context? }` — clients already handle JSON error objects, the shape is additive
- New `x-request-id` header is additive

---

## Task List

### RSP-3725: Structured Logging & Correlation IDs

| # | Task | Files | Reuse |
|---|------|-------|-------|
| 1 | Add `dd-trace` dependency | `package.json` | pnpm catalog `5.85.0` |
| 2 | Create `tracer.ts` | `src/utils/tracer.ts` (new) | Copy from `packages/external-api/src/utils/tracer.ts` |
| 3 | Import tracer first in app.ts | `src/app.ts` | — |
| 4 | Update logger with Pino mixin | `src/utils/logger.ts` | Copy mixin from `packages/external-api/src/utils/logger.ts` |
| 5 | Create `AsyncLocalStorage` request store | `src/utils/request-store.ts` (new) | — |
| 6 | Create request context middleware | `src/middleware/request-context.ts` (new) | Pattern from `packages/external-api/src/middleware/request-logger.middleware.ts` |
| 7 | Register middleware in server.ts, remove inline logging middleware | `src/server.ts` | — |
| 8 | Add `x-correlation-id` header to tRPC executor | `src/tools/tool-executor.ts` | — |
| 9 | Add `x-correlation-id` header to REST executor | `src/tools/rest-executor.ts` | — |
| 10 | Add `x-correlation-id` header to module checker | `src/auth/module-checker.ts` | — |
| 11 | Unit tests for request context middleware | `src/tests/request-context.test.ts` (new) | — |
| 12 | Update existing executor tests for correlation ID headers | `src/tests/tool-executor.test.ts`, `src/tests/rest-executor.test.ts` | — |
| 13 | Run lint + type check + tests | — | — |

### RSP-3728: Graceful Error Responses

| # | Task | Files | Reuse |
|---|------|-------|-------|
| 1 | Create `McpError` base class | `src/errors/mcp-error.ts` (new) | — |
| 2 | Create error subclasses | `src/errors/validation-error.ts`, `authentication-error.ts`, `authorization-error.ts`, `external-service-error.ts`, `rate-limit-error.ts`, `tool-execution-error.ts`, `not-found-error.ts` (new), `src/errors/index.ts` (new) | — |
| 3 | Create error handler middleware | `src/middleware/error-handler.ts` (new) | — |
| 4 | Register error handler in server.ts | `src/server.ts` | — |
| 5 | Refactor `executor-factory.ts` — throw typed exceptions | `src/tools/executor-factory.ts` | — |
| 6 | Refactor `rest-executor.ts` — throw typed exceptions | `src/tools/rest-executor.ts` | Keep `formatRestError()` |
| 7 | Refactor `tool-executor.ts` — throw typed exceptions | `src/tools/tool-executor.ts` | — |
| 8 | Refactor `authenticate.ts` — throw typed exceptions | `src/auth/authenticate.ts` | — |
| 9 | Refactor `dcr-proxy.ts` — throw typed exceptions where appropriate | `src/auth/dcr-proxy.ts` | — |
| 10 | Unit tests for error classes | `src/tests/errors.test.ts` (new) | — |
| 11 | Unit tests for error handler middleware | `src/tests/error-handler.test.ts` (new) | — |
| 12 | Update existing tests for thrown exceptions | `src/tests/executor-factory.test.ts`, `src/tests/rest-executor.test.ts`, `src/tests/tool-executor.test.ts`, `src/tests/authenticate.test.ts` | — |
| 13 | Run lint + type check + tests | — | — |

### RSP-3726: Datadog APM & Error Tracking

| # | Task | Files | Reuse |
|---|------|-------|-------|
| 1 | Create metrics utility | `src/utils/metrics.ts` (new) | — |
| 2 | Add custom spans to executor-factory | `src/tools/executor-factory.ts` | — |
| 3 | Verify auto-instrumentation of fetch calls (staging) | — | — |
| 4 | Add error tagging to error handler middleware | `src/middleware/error-handler.ts` | — |
| 5 | Emit `toolExecuted` / `toolError` metrics in executor-factory | `src/tools/executor-factory.ts` | — |
| 6 | Emit `authSuccess` / `authFailure` metrics in authenticate.ts | `src/auth/authenticate.ts` | — |
| 7 | Emit `dcrRequest` metrics in dcr-proxy.ts | `src/auth/dcr-proxy.ts` | — |
| 8 | Unit tests for metrics | `src/tests/metrics.test.ts` (new) | — |
| 9 | Create Datadog dashboard (manual in UI or JSON export) | — | — |
| 10 | Configure Datadog alerts | — | — |
| 11 | Run lint + type check + tests | — | — |

### Infrastructure

| # | Task | Files |
|---|------|-------|
| 1 | Verify Datadog agent APM port config in CDK | `cdk-stack/lib/datadog.ts` |
| 2 | Close RSP-3700 as duplicate | Linear |

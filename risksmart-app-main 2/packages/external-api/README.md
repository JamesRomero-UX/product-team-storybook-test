# RiskSmart External API

A production-ready REST API service that provides external access to RiskSmart risk management data. Built with Express.js, TypeScript, and integrated with circuit breaker patterns for reliability.


## Overview

The External API serves as a gateway for external clients to access RiskSmart's risk management data through a clean REST interface. It integrates with the internal tRPC service to provide comprehensive risk data while maintaining strong type safety, authentication, and reliability patterns.

### Key Use Cases

- **External Risk Data Access** - Provides REST endpoints for risk management data
- **Client Integration** - Enables third-party applications to integrate with RiskSmart
- **Mobile/Web Applications** - Supports frontend applications with standardized REST API
- **Data Export/Import** - Facilitates data exchange with external systems

## Features

### ✅ Current Features

- **REST API Endpoints** - Complete CRUD operations for risk entities
- **tRPC Integration** - Seamless integration with internal tRPC service
- **Circuit Breaker Protection** - Built-in resilience patterns (breakers, retries, bulkheads)
- **JWT Authentication** - Token-based authentication with scope validation
- **Request/Response Validation** - Zod schema validation with OpenAPI support
- **API Versioning (Compat)** - Date-based versioning with automatic schema transformations
- **Structured Logging** - Request tracing and error logging with Pino
- **TypeScript** - Full type safety with strict compilation
- **Comprehensive Testing** - Unit tests with Vitest
- **OpenAPI Documentation** - Auto-generated versioned API documentation
- **Health Checks** - Service health monitoring endpoints
- **Metrics Collection** - Circuit breaker and performance metrics

### 🚧 Work in Progress Features

- **Rate Limiting** - Request rate limiting and throttling
- **Enhanced Auth Integration** - Extended authentication with RBAC
- **Additional Endpoints** - More entity endpoints (actions, controls, assessments)
- **Caching Layer** - Redis-based response caching
- **Webhook Support** - Event-driven notifications

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm package manager
- Running tRPC service (see `packages/trpc`)

### Installation

```bash
# Install dependencies from project root
pnpm install

# Or install for this package specifically
pnpm --filter=@risksmart-app/external-api install
```

### Development

```bash
# Start development server with hot reloading
pnpm --filter=@risksmart-app/external-api run dev

# The service will start on http://localhost:3300
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Server Configuration
PACKAGE_VERSION="0.0.1-dev-local"
PORT=3300
NODE_ENV="development"
LOG_LEVEL="debug"

# tRPC Service Configuration
TRPC_SERVICE_BASE_URL="http://localhost"
TRPC_SERVICE_PORT=2021
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm run dev` | Start development server with hot reloading |
| `pnpm run build` | Build production bundle |
| `pnpm run start` | Start production server |
| `pnpm run lint` | Run ESLint checks |
| `pnpm run lint:fix` | Fix auto-fixable linting issues |
| `pnpm run test:unit` | Run unit tests |
| `pnpm run test:watch` | Run tests in watch mode |
| `pnpm run test:coverage` | Generate test coverage report |
| `pnpm run tsc` | Type-check without emitting files |

## API Structure

### Base URL
```
http://localhost:3300/v1
```

### Authentication
All endpoints require JWT authentication with appropriate scopes:

```bash
curl -H "Authorization: Bearer <jwt_token>" \
     http://localhost:3300/v1/risks
```

### Endpoints

#### Risks API

| Method | Endpoint | Description | Scope |
|--------|----------|-------------|--------|
| `GET` | `/risks` | List all risks with pagination | `read:risks` |
| `GET` | `/risks/:id` | Get specific risk by ID | `read:risks` |
| `POST` | `/risks` | Create new risk | `create:risks` |
| `PUT` | `/risks/:id` | Update existing risk | `update:risks` |
| `DELETE` | `/risks/:id` | Delete risk | `delete:risks` |

#### System Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check endpoint |
| `GET` | `/docs` | OpenAPI documentation |
| `GET` | `/metrics` | Circuit breaker metrics |

### Request/Response Format

#### List Risks Response
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "title": "Data Breach Risk",
      "description": "Risk of unauthorized access to customer data",
      "severity": "high",
      "status": "open",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "tenantId": "org-123"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## API Versioning (inc Compat Versioning)

The External API implements an "adjacent transform" date-based API versioning system that allows backward compatibility while evolving the API. This approach ensures existing client integrations continue working while new features and improvements are added. Freedom to develop the API without getting bogged down with maintaining older versions throughout the codebase.

### Path level version

The API has a versioned prefixed path `~/api/v1/`. Although this reserves the right to make use of this version at some point (e.g. add a v2), it’s not likely to change for some time unless for a full API redesign.

### Version Format

API versions follow the `YYYY-MM-DD` format (e.g., `2025-10-14`). Each version represents a snapshot of the API schema at that date.

### Requesting a Specific Version

Clients can request a specific API version using the `Risksmart-Version` header:

```bash
curl -H "Authorization: Bearer <token>" \
     -H "Risksmart-Version: 2025-10-10" \
     http://localhost:3300/api/v1/controls
```

If no version header is provided, the API returns the latest version.

### How Versioning Works

The versioning system uses **Zod schema transformations** to automatically downgrade responses from the latest version to older versions:

1. **Latest Schema** - All responses are generated using the current schema
2. **Transformation Chain** - When an older version is requested, the response is transformed through a chain of Zod schemas
3. **Type Safety** - All transformations are type-safe and validated
4. **OpenAPI Support** - Documentation automatically reflects the requested version

### Supported Versions

Current supported API versions:
- `2025-10-14` (Latest)
- `2025-10-10`
- `2025-09-01`

### Creating a New API Version

When you need to make breaking changes to the API, follow these steps:

#### 1. Update the Current Version

Edit `src/versions/index.ts` and update the `CURRENT_API_VERSION`:

```typescript
export const CURRENT_API_VERSION = '2025-11-01' as const; // New version
```

#### 2. Create Version-Specific Schemas

In `src/schemas/versions/<resource>.schemas.ts`, create the transformation schema for the **previous version**:

```typescript
// Transform FROM latest (2025-11-01) TO previous version (2025-10-14)
export const ControlItemTransform_to_v2025_10_14 = ControlItemResponseSchema.transform(
  (data) => {
    // Apply transformations to match the old schema
    // Example: Rename a field
    const { newFieldName, ...rest } = data;
    return {
      ...rest,
      oldFieldName: newFieldName,
    };
  }
);

// Define the output schema for the old version
export const ControlItemResponseSchema_v2025_10_14 = z.object({
  // ... schema definition matching the old version
  oldFieldName: z.string(),
});
```

#### 3. Register the Schema Version

Update `src/versions/<resource>/schema-registry.ts` to add the new version entry:

```typescript
export const controlItemResponseSchemaVersions: Record<
  Compat,
  SchemaVersionDefinition<'response'>
> = {
  '2025-10-14': {
    version: '2025-10-14',
    schemaType: 'response',
    description: 'Renamed newFieldName to oldFieldName for compatibility',
    outputSchema: ControlItemResponseSchema_v2025_10_14,
    transformFromPrevious: ControlItemTransform_to_v2025_10_14,
    changes: [
      {
        type: 'breaking',
        description: 'Renamed `oldFieldName` to `newFieldName`',
        fields: ['oldFieldName', 'newFieldName'],
        impact: 'response',
      },
    ],
  },
  // ... existing versions
};
```

#### 4. Update Supported Versions List

Add the new version to `SUPPORTED_API_VERSIONS` in `src/versions/index.ts`:

```typescript
export const SUPPORTED_API_VERSIONS = [
  '2025-11-01', // New version
  '2025-10-14',
  '2025-10-10',
  '2025-09-01',
] as const;
```

#### 5. Test the Versioning

Run tests to ensure the transformations work correctly:

```bash
# Type check
pnpm --filter=@risksmart-app/external-api run tsc

# Lint
pnpm --filter=@risksmart-app/external-api run lint:fix

# Test
pnpm --filter=@risksmart-app/external-api run test:unit
```

#### 6. Update OpenAPI Documentation

The OpenAPI documentation automatically generates versioned schemas. Test by requesting different versions:

```bash
# Get OpenAPI spec for version 2025-10-14
curl -H "Authorization: Bearer <token>" \
     "http://localhost:3300/api/v1/docs/openapi.json?risksmart_version=2025-10-14"
```

### Best Practices

- **Minimize Breaking Changes** - Only create new versions for true breaking changes (e.g additions to schemas or new endpoints are not breaking changes).
- **Document Changes** - Always provide clear descriptions in the `changes` array
- **Test Transformations** - Verify transformations work correctly with real data
- **Deprecation Period** - Give clients adequate time to migrate (typically 6-12 months)
- **Version Naming** - Use the date when the change is released, not when it's developed

### Architecture

The versioning system is built on these core components:

- **`src/versions/index.ts`** - Version configuration and constants
- **`src/versions/<resource>/schema-registry.ts`** - Schema version registry per resource
- **`src/schemas/versions/<resource>.schemas.ts`** - Zod schemas and transformations
- **`src/utils/schema-versioning.ts`** - Core transformation logic
- **`src/utils/versions.ts`** - Helper functions for versioning responses
- **`src/middleware/api-version.middleware.ts`** - Version extraction middleware

## Documentation

### OpenAPI Documentation
Access interactive API documentation at:
```
http://localhost:3300/docs
```

The documentation is automatically generated from Zod schemas and provides:
- **Interactive testing** - Try API endpoints directly from the docs
- **Schema definitions** - Complete request/response schemas
- **Authentication examples** - How to authenticate requests
- **Error responses** - Detailed error response formats

### Type Definitions
All API types are defined using Zod schemas in `src/schemas/` and automatically converted to OpenAPI specifications.

## Circuit Breaker & Resilience

The service implements comprehensive resilience patterns using [Cockatiel](https://www.npmjs.com/package/cockatiel):

### Circuit Breaker
- **Threshold**: 5 consecutive failures trigger opening
- **Timeout**: 60-second timeout before attempting to close
- **States**: Closed → Open → Half-Open → Closed
- **Manual Override**: Force open/closed states via `/metrics` endpoint

### Retry Policy
- **Max Attempts**: 3 retry attempts
- **Backoff**: Exponential backoff starting at 200ms
- **Transient Failures**: Automatic retry on network/timeout errors

### Bulkhead Pattern
- **Concurrency Limit**: 20 concurrent requests max
- **Queue Size**: 100 queued requests max
- **Isolation**: Prevents cascade failures

### Configuration
```typescript
{
  threshold: 5,           // Circuit breaker failure threshold
  resetTimeout: 60000,    // Reset timeout (60s)
  retryAttempts: 3,       // Max retry attempts
  backoffBaseDelay: 200,  // Base retry delay (200ms)
  maxConcurrency: 20,     // Max concurrent requests
  maxQueueSize: 100       // Max queued requests
}
```

### Metrics Endpoint
Access circuit breaker metrics at `/metrics`:

```json
{
  "retries": 45,
  "breakerTrips": 2,
  "breakerResets": 1,
  "halfOpens": 3,
  "bulkheadRejects": 12,
  "bulkheadQueueSize": 5,
  "lastTrippedAt": "2023-01-01T12:00:00.000Z",
  "breakerState": "Closed"
}
```

## tRPC Integration

The External API integrates seamlessly with the internal tRPC service:

### Architecture
```
External Client → REST API → tRPC Client → tRPC Server → Database
```

### Data Flow
1. **REST Request** - Client makes REST API request
2. **Authentication** - JWT token validation and scope checking  
3. **Circuit Breaker** - Request passes through resilience patterns
4. **tRPC Call** - Converted to tRPC procedure call
5. **Data Transformation** - tRPC data mapped to REST format
6. **Response** - JSON response returned to client

### Type Safety
- **Shared Types** - Uses types from `@risksmart-app/trpc`
- **Automatic Validation** - Request/response validation with Zod
- **Compile-time Safety** - TypeScript ensures type consistency

### Configuration
```typescript
// tRPC Client Configuration
{
  baseUrl: process.env.TRPC_SERVICE_BASE_URL,
  port: process.env.TRPC_SERVICE_PORT,
  headers: {
    authorization: req.headers.authorization,
    'x-tenant-id': req.headers['x-tenant-id']
  }
}
```

### Supported Operations
- ✅ **Risk Read Operations** - Full tRPC integration for GET operations
- ⏸️ **Risk Write Operations** - Prepared for when tRPC exposes mutations
- ✅ **Authentication Passthrough** - JWT and tenant context forwarding
- ✅ **Error Handling** - Comprehensive error mapping and logging

## Logging

Structured logging with [Pino](https://github.com/pinojs/pino):

### Log Levels
- `fatal` - System crashes
- `error` - Error conditions  
- `warn` - Warning conditions
- `info` - Informational messages
- `debug` - Debug-level messages
- `trace` - Very detailed tracing

### Request Logging
Every request includes:
- **Request ID** - Unique identifier for tracing
- **User Context** - User ID, tenant ID, scopes
- **Timing** - Request duration
- **Status** - HTTP status codes
- **Errors** - Detailed error information

### Example Log Entry
```json
{
  "level": 30,
  "time": 1640995200000,
  "pid": 12345,
  "hostname": "api-server",
  "reqId": "req-123",
  "req": {
    "method": "GET",
    "url": "/api/v1/risks",
    "headers": { "authorization": "[Redacted]" }
  },
  "event": "risks_list_success",
  "count": 10,
  "total": 100,
  "msg": "Risks list fetched successfully from tRPC service"
}
```

## Testing

### Running Tests
```bash
# Run all tests
pnpm run test:unit

# Watch mode for development
pnpm run test:watch

# Generate coverage report
pnpm run test:coverage
```

### Test Structure
- **Unit Tests** - Individual component testing
- **Integration Tests** - API endpoint testing
- **Circuit Breaker Tests** - Resilience pattern testing
- **Schema Validation Tests** - Request/response validation

### Coverage Goals
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient scope)
- `404` - Not Found
- `429` - Too Many Requests (bulkhead rejection)
- `500` - Internal Server Error
- `501` - Not Implemented (pending tRPC mutations)
- `503` - Service Unavailable (circuit breaker open)

### Error Response Format
```json
{
  "error": {
    "message": "Validation failed",
    "status": 400,
    "details": {
      "field": "title",
      "code": "required"
    }
  }
}
```

## Security

### Authentication
- **JWT Tokens** - Bearer token authentication
- **Scope-based Authorization** - Fine-grained access control
- **Tenant Isolation** - Multi-tenant data separation

### Request Validation
- **Input Sanitization** - All inputs validated with Zod
- **Schema Enforcement** - Strict request/response schemas
- **Header Validation** - Required headers enforced

### Security Headers
- **CORS** - Cross-origin request handling
- **Content-Type** - Strict content type validation
- **Authorization** - Token validation middleware

## Contributing

1. **Fork** the repository
2. **Create** a feature branch
3. **Write** tests for new functionality
4. **Ensure** all tests pass and linting is clean
5. **Submit** a pull request

### Code Standards
- **TypeScript** - Strict type checking
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **Testing** - Comprehensive test coverage
- **Documentation** - Clear code documentation

## License

Internal RiskSmart project - proprietary license.

---

For more information, see the [tRPC service documentation](../trpc/README.md) or contact the development team.
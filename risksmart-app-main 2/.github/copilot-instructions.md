# RiskSmart App Development Instructions

## Architecture Overview

**Multi-tenant risk management platform** built as a TypeScript monorepo with:

- **Frontend**: React + TypeScript + Cloudscape Design System + Tailwind CSS
- **Backend**: Node.js + SST + Hasura GraphQL + Express REST + tRPC (migration in progress)
- **Database**: PostgreSQL with tenant-specific schemas
- **Infrastructure**: AWS CDK + SST for deployment
- **Build System**: pnpm workspaces + Turbo monorepo

## Critical Development Workflows

### Running the Application

```bash
# Essential services (run in parallel)
pnpm run api          # Docker: Hasura + PostgreSQL
pnpm run start        # Vite dev server (port 3000)
pnpm run sst:dev     # SST live development (REST API)
```

### Type Generation & GraphQL

```bash
# Always run after database changes
pnpm run mg          # migrate + generate types
pnpm run generate-graphql  # Generate GraphQL types from Hasura
pnpm run sst:types   # Generate SST types
```

### AWS CDK & SAM Local Development

```bash
# CDK commands always use pnpm exec for workspace dependency resolution
pnpm exec cdk [command]         # Standard CDK commands

# Local development workflow (SAM + CDK)
node scripts/dev.js             # Full local setup: CDK synth + SAM APIs + event router + SQS poller
node scripts/dev.js --skip-synth  # Skip CDK synth (use existing cdk.out/)
node scripts/dev.js --no-watch    # Disable file watcher (used in CI)
```

### Testing Strategy

```bash
# Single package testing (RECOMMENDED)
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/path/to/test.ts

# All tests
pnpm run test:unit   # Unit tests across packages
pnpm run test:e2e    # Playwright e2e tests
```

## Key Architectural Patterns

### GraphQL to tRPC Migration

- **Feature Flag**: `trpc` controls query routing
- **Pattern**: Wrapper hooks switch between GraphQL/tRPC based on flag
- **Location**: `packages/web/src/hooks/queries/*/` contains both implementations

### Cloudscape Design System Integration

- **Theme**: Custom themed components at `@risk-smart/themed-cloudscape-components`
- **Usage**: Replace `@cloudscape-design/components` with themed equivalents
- **CSS**: CSS Modules + Tailwind for custom styling, preflight disabled

### State Management Migration

- **From**: React Context → **To**: Zustand stores
- **Pattern**: See `packages/web/src/pages/dashboards/useDashboardStore.ts`
- **Benefits**: Reduced re-renders, better testability

### Package Structure

- `packages/web/` - Main React application
- `packages/rest-api/` - Express REST API handlers
- `packages/trpc/` - tRPC server and routes
- `packages/components/` - Shared UI components
- `packages/web-graphql-client/` - Generated GraphQL types/hooks
- `packages/tenant-deployer/` - AWS CDK infrastructure for tenant deployment
- `stacks/` - SST deployment stacks

### Dependency Management

- **pnpm Catalog**: All dependency versions are centralized in `pnpm-workspace.yaml`
- **CDK Tools**: Always use `pnpm exec cdk` for workspace consistency
- **New Dependencies**: Add to catalog first, then reference as `"package": "catalog:"` in package.json

## Project-Specific Conventions

### Component Testing

- **Cloudscape quirk**: Components render as `button` elements, not `combobox`
- **Dropdowns**: Click button first, then find `combobox` input
- **Multi-select**: Default values are arrays of IDs: `['risk-1', 'risk-2']`

### Environment Setup

- **Docker**: Use `pnpm run api:min` for Hasura+PostgreSQL
- **SST**: Live development with `pnpm run sst:dev`
- **Tenant**: Multi-tenant architecture with org-scoped permissions

### Code Quality Gates

```bash
# Pre-commit requirements
pnpm run lint        # ESLint with custom rules
pnpm run tsc         # TypeScript compilation
pnpm run test:unit   # Must pass before committing
```

### Code Quality Rules (Datadog Static Analysis)

The codebase enforces several code quality rules via Datadog static analysis:

- **Boolean property naming**: Boolean props/parameters must be prefixed with `is` or `has`
  - ❌ `unwrapData`, `wrapInArray`, `enabled`
  - ✅ `isResponseWrapped`, `isSingleItem`, `isEnabled`

- **Maximum 4 parameters**: Functions should have at most 4 parameters. Use object destructuring for more:
  - ❌ `function foo(tenant, orgKey, userId, correlationId, body)`
  - ✅ `function foo(context: ApiRequestContext, correlationId, body)`

- **No single-child fragments**: Don't wrap single elements in React fragments:
  - ❌ `content: <>{error.message}</>`
  - ✅ `content: error.message`

- **Use pnpm catalog for dependencies**: All dependency versions must use `catalog:` reference:
  - ❌ `"@types/uuid": "^10.0.0"`
  - ✅ `"@types/uuid": "catalog:"`

For comprehensive context, refer to the [AI Context Priming Guide](ai/docs/general-context.md).

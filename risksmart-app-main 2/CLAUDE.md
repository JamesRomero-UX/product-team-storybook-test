# RiskSmart App

Enterprise GRC (Governance, Risk, Compliance) platform. TypeScript monorepo on AWS.

## Tech Stack

- **Frontend**: React 19, Vite, Cloudscape Design System, TailwindCSS
- **Backend**: Node.js, tRPC 11, Express, Hasura GraphQL, AWS Lambda
- **Database**: PostgreSQL (Drizzle ORM), DynamoDB
- **Infrastructure**: AWS CDK, SST, Docker, AWS SAM (local Lambda emulation)
- **Auth**: Auth0, Permit.io (ABAC)
- **Testing**: Vitest, Playwright, MSW, Testing Library

## Monorepo Structure

Code lives in `packages/` (30 packages) and `services/` (6 Lambda services). Each has its own CLAUDE.md with package-specific guidance. Infrastructure config is in `api-stack/`, `cdk-stack/`, and `stacks/`.

Key packages:

- `packages/web` - Main React frontend
- `packages/trpc` - tRPC server (backend for frontend)
- `packages/rest-api` - REST API layer (Hasura GraphQL)
- `packages/external-api` - External-facing REST API
- `packages/drizzle` - Drizzle ORM database layer
- `packages/atomic-ui` - New component library (replacing Cloudscape)
- `packages/components` - Shared React components
- `packages/e2e` - Playwright E2E tests
- `packages/test-data` - Shared test data builders/clients
- `services/data-layer` - HTTP API gateway Lambda
- `services/permissions` - EventBridge permissions sync (Permit.io)

## Environment

- Node.js 20.x required
- `.env` file must exist at the repo root - Turborepo uses it as a global dependency for builds

## Commands

IMPORTANT: Do not attempt to start, run, or serve the application. The local dev environment requires Docker, AWS SAM CLI, multiple services started in sequence, and CDK synth for template generation - the user manages this themselves.

IMPORTANT: Always scope commands to the specific package you're working in. Root-level commands (e.g. `pnpm run lint`) run across ALL 30+ packages via Turborepo and will crash due to memory limits. Use `--filter` to target a single package.

```bash
# ALWAYS use --filter for linting and testing
pnpm exec turbo lint --filter=@risksmart-app/web
pnpm exec turbo test:unit --filter=@risksmart-app/web
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/path/to/test.ts

# Type generation (run when types are stale)
pnpm run generate-graphql     # Generate GraphQL types
pnpm run sst:types            # Generate SST types
pnpm run db:pull              # Generate database types from schema
pnpm exec turbo generate:api-types --filter=@risksmart-app/external-api  # Generate OpenAPI types
```

## Coding Conventions

- **Arrow function syntax**: Always use `const` arrow functions instead of the `function` keyword for all TypeScript/TSX declarations (including exported, non-exported, and async functions). This applies to source files and test helpers alike.
  ```typescript
  // Good
  export const myFunction = (param: string): string => { ... };
  const helper = async (id: string): Promise<void> => { ... };

  // Bad
  export function myFunction(param: string): string { ... }
  async function helper(id: string): Promise<void> { ... }
  ```
  Exception: React component default exports using `const Component: FC = () => ...` are already arrow functions and need no change.

## Package Scope

All packages scoped under `@risksmart-app/`. Use `workspace:*` for internal dependencies.

## Build System

Turborepo orchestrates builds. Key task dependencies:

- `build` depends on `^build` and `generate-graphql`
- Run `pnpm run generate-graphql` if GraphQL schemas changed

## Zapier Integration Contract

The Zapier integration app lives in `packages/zapier-app`. It depends on the
REST API schemas in `packages/external-api/src/schemas/`. A contract snapshot
(`packages/zapier-app/api-contract.snapshot.json`) tracks which API response
shapes Zapier triggers/actions depend on.

**If you modify any Zod schema in `packages/external-api/src/schemas/`:**

1. Regenerate OpenAPI types:
   `pnpm exec turbo generate:api-types --filter=@risksmart-app/external-api`
2. Run `pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app`
3. If it fails, the Zapier app needs updating. See §16.2 in ZAPIER_INTEGRATION_SPEC.md.
4. After updating Zapier trigger/action definitions, regenerate the snapshot:
   `pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app`

**If you add a new REST API write endpoint (POST/PUT/DELETE):**

1. Consider adding a matching Zapier action in `packages/zapier-app/src/actions/`.
2. If the entity has custom fields, the Zapier action must use dynamic `inputFields`
   (see `packages/zapier-app/src/fields/custom-fields.ts`).

**If you add a new Knock notification workflow:**

1. Update `packages/knock/partials/deep-link-partial-email` with the route mapping.

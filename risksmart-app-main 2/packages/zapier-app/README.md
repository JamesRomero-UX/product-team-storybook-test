# @risksmart-app/zapier-app

Zapier integration app for RiskSmart. Provides actions and searches that run on Zapier's infrastructure via `zapier-platform-core`.

## Setup

```bash
# Install dependencies (from repo root)
pnpm install

# Install the Zapier CLI globally
npm install -g zapier-platform-cli

# Log in to Zapier
zapier-platform login
```

## Development

```bash
# Build (tsup)
pnpm exec turbo build --filter=@risksmart-app/zapier-app

# Type-check
pnpm exec turbo typecheck --filter=@risksmart-app/zapier-app

# Lint
pnpm exec turbo lint --filter=@risksmart-app/zapier-app

# Run tests (also validates API contract)
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app
```

## API Contract

The app tracks which external-api response shapes it depends on via `api-contract.snapshot.json`.

```bash
# Validate that external-api schemas haven't introduced breaking changes
pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app

# Regenerate snapshot after updating actions/searches
pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app
```

## Deploying to Zapier

```bash
# Validate the app structure
cd packages/zapier-app && zapier-platform validate

# Build and push to Zapier
cd packages/zapier-app && pnpm run push

# Promote a version to production
zapier-platform promote <version> --yes
```

## Testing Zaps

After pushing a development version:

1. Go to [zapier.com](https://zapier.com) and create a new Zap
2. Search for "RiskSmart" in the app selector (development versions appear for your account)
3. Choose an action or search to test
4. Connect with your External API credentials (client key + secret)
5. Run the Zap step to verify it works against your environment

## Project Structure

```
src/
  actions/       CRUD actions (create, update, delete per entity)
  searches/      Find-by-ID, find-by-criteria, list, enrichment searches
  fields/        Dynamic field resolvers (custom fields)
  middleware/    afterResponse handlers (401, 429)
  utils/         API helpers, pagination, field mapping
  authentication.ts  Session auth config
  index.ts       App definition (registered actions, searches, triggers)
scripts/
  lib/snapshot.ts          Contract snapshot generation + breaking change detection
  generate-api-snapshot.ts Write snapshot to disk
  validate-api-contract.ts Validate current schemas against committed snapshot
test/                      Vitest tests
```

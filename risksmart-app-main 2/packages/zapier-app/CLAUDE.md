# packages/zapier-app

Zapier integration app for RiskSmart. Defines actions and searches
that run on Zapier's infrastructure. Built with `zapier-platform-core`.

## Architecture

- `src/actions/` - CRUD actions (create, update, delete per entity)
- `src/searches/` - Find-by-ID, find-by-criteria, list, and enrichment searches
- `src/fields/` - Dynamic field resolvers (custom fields, linked items)
- `src/utils/` - API helpers, field type mapping, pagination
- `test/` - Unit tests (nock-based, no network)
- `test/integration/` - Integration tests (real HTTP to staging API)
- `api-contract.snapshot.json` - Frozen API schema snapshot for contract validation

## Commands

```bash
# Unit tests (nock-based, no network)
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app

# Lint
pnpm exec turbo lint --filter=@risksmart-app/zapier-app

# Type check
cd packages/zapier-app && pnpm run tsc

# Build (tsup → dist/)
pnpm exec turbo build --filter=@risksmart-app/zapier-app

# Validate Zapier app structure (zapier-platform validate)
pnpm exec turbo validate --filter=@risksmart-app/zapier-app

# Validate API contract hasn't broken
pnpm exec turbo validate:api-contract --filter=@risksmart-app/zapier-app

# Regenerate snapshot after updating triggers/actions
pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app

# Integration tests — Layer 1 (in-process, real HTTP to staging)
pnpm exec turbo test:integration --filter=@risksmart-app/zapier-app

# Integration tests — Layer 2 local (Zapier CLI on your machine)
cd packages/zapier-app && pnpm run test:invoke

# Integration tests — Layer 2 push snapshot for remote testing
cd packages/zapier-app && pnpm run test:invoke-push

# Integration tests — Layer 2 remote (runs on Zapier's servers)
cd packages/zapier-app && pnpm run test:invoke-remote

# Deploy to Zapier
cd packages/zapier-app && pnpm run push
```

## Key Patterns

- **Dynamic fields:** Custom fields are per-org, per-entity-type. All actions
  that touch entities with custom fields MUST use the dynamic
  `inputFields` pattern from `src/fields/custom-fields.ts`.
  Never hardcode custom field definitions.

- **API versioning:** All requests MUST include `risksmart_version` query param
  pinned to the version matching the snapshot. Never use "latest".

- **Contract snapshot:** `api-contract.snapshot.json` is checked in and validated
  on every CI run. If `packages/external-api` schemas change in a breaking way,
  CI fails until the Zapier app is updated.

- **OpenAPI type checking:** All sample objects in searches and actions use
  `satisfies Partial<EntityType>` to type-check against the generated OpenAPI
  types from `@risksmart-app/external-api/api-types`. This catches field name
  typos and type mismatches at compile time. Import types from `src/types/api.ts`.
  - For list samples with `_zapierLabel`, use `satisfies Partial<T> & { _zapierLabel?: string }`
  - For enrichment searches with extra nested fields, use `satisfies Partial<T> & Record<string, unknown>`
  - For delete actions, use `satisfies MutationResponse` (from `ApiSchema<'MutationResponse'>`)

- **No triggers yet:** The `triggers` object in `src/index.ts` is currently empty.
  Triggers are planned but not implemented.

## Adding a New Action

1. Create `src/actions/{verb}_{entity}.ts` following `create_risk.ts` pattern
2. If entity supports custom fields, add dynamic `inputFields` from `src/fields/`
3. Add `satisfies Partial<EntityType>` on the sample object (import type from `src/types/api.ts`)
4. Register in `src/index.ts` under `creates`
5. Add `test/actions/{verb}_{entity}.test.ts`
6. Run `pnpm exec turbo generate:api-snapshot --filter=@risksmart-app/zapier-app`

## Adding a New Search

1. Create `src/searches/{name}.ts` following `find_risk.ts` pattern
2. Add `satisfies Partial<EntityType>` on the sample object (import type from `src/types/api.ts`)
3. Register in `src/index.ts` under `searches`
4. Add `test/searches/{name}.test.ts`

## Integration Tests

Two layers of integration tests complement the nock-based unit tests:

### Layer 1: `createAppTester` (in-process, real HTTP)

Uses `zapier-platform-core`'s test harness to run the full middleware chain
(auth token exchange, error handling, retry) in-process with real HTTP calls
to a real API. Fast, debuggable, type-safe.

- Config: `vitest.integration.config.ts` (separate from unit test config)
- Setup: `test/integration/setup.ts` (validates env vars, no nock)
- Helpers: `test/integration/helpers.ts` (`appTester`, `authBundle()`, `TEST_PREFIX`)
- Tests: `test/integration/*.integration.test.ts`

What it covers:
- Auth: session token exchange, auth test endpoint, connection label
- Risk lifecycle: create → find → list → update → overview → delete
- Indicator lifecycle: create parent risk → create indicator → find → list → update → delete
- Read-only: list pagination for risks/controls/issues/policies, 404 handling

### Layer 2: `zapier-platform invoke` (Zapier CLI runtime)

Runs actions/searches through the Zapier CLI's `invoke` command. Two modes:

**Local mode** (`test:invoke`) — runs code on your machine through the Zapier
CLI runtime. Works with port-forwarded or staging APIs. No push required.
The script writes a temporary `.env` with `authData_`-prefixed credentials,
runs `auth refresh` to exchange for a session key, then invokes each test.

**Remote mode** (`test:invoke-remote`) — runs on Zapier's actual servers
against a pushed snapshot. API must be publicly reachable from Zapier.
Requires `test:invoke-push` first, a valid `ZAPIER_DEPLOY_KEY`, and a
`ZAPIER_INVOKE_AUTH_ID` (see Step 4 in the manual test flow).

What it covers:
- Auth test (local mode only — remote mode skips, Zapier handles auth internally)
- 11 list searches (all entity types)
- 12 find-by-ID searches (nonexistent ID — verifies no error)
- 3 owner searches (find_actions/issues/risks_by_owner)
- 2 enrichment searches (get_risk_overview, get_issue_details)
- Local mode: 29 tests total (1 auth + 28 searches)
- Remote mode: 28 tests total (auth skipped)
- Tests with 403 "Insufficient scope" are reported as SKIP (not FAIL)

### Snapshot versioning

| Context | Suffix | Example version |
|---------|--------|----------------|
| Local dev | `whoami` | `0.0.0-richardpoole` |
| CI (PR) | `pr-{N}` | `0.0.0-pr-42` |
| Release | semver from package.json | `1.0.0` |

Snapshots are private, can't be promoted, and multiple coexist safely.

### Manual test flow

**One-time setup:**

```bash
cd packages/zapier-app
cp .env.integration.example .env.integration
```

Edit `.env.integration` with real credentials:
```
ZAPIER_INTEGRATION_CLIENT_KEY=<your-client-key>
ZAPIER_INTEGRATION_CLIENT_SECRET=<your-client-secret>
ZAPIER_INTEGRATION_API_BASE_URL=https://<your-api-host>
ZAPIER_INTEGRATION_OWNER_ID=<valid-user-id-in-tenant>
ZAPIER_DEPLOY_KEY=<zapier-cli-deploy-key>          # only needed for push/remote
ZAPIER_INVOKE_AUTH_ID=<integer>                    # only needed for remote invoke
```

### Zapier config files

| File | Location | Purpose | Secret? |
|------|----------|---------|---------|
| `~/.zapierrc` | User home dir | Deploy key (CLI auth token). Generated by `zapier-platform login`. | Yes — this is the `ZAPIER_DEPLOY_KEY` for CI. |
| `.zapierapprc` | Package root | App ID (`236769`). Identifies this integration on Zapier. | No — safe to commit. |

To get a deploy key: run `zapier-platform login` and authenticate. The key is written
to `~/.zapierrc` as `deployKey`. Copy this value into `ZAPIER_DEPLOY_KEY` in
`.env.integration` (for local remote tests) or the GitHub `staging` environment
secret (for CI).

**Step 1 — Unit tests (no credentials needed):**

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/zapier-app
```

Runs 231 nock-based tests. No network calls. Should always pass.

**Step 2 — Layer 1 integration tests:**

```bash
pnpm exec turbo test:integration --filter=@risksmart-app/zapier-app
```

Runs 23 tests against the real API. Creates test entities (prefixed with
`[zapier-int-<timestamp>]`), verifies CRUD operations, cleans up after.
Requires `ZAPIER_INTEGRATION_*` env vars from `.env.integration`.

**Step 3 — Layer 2 local invoke:**

```bash
cd packages/zapier-app && pnpm run test:invoke
```

Runs 5 tests through the Zapier CLI runtime on your machine. Uses the same
`ZAPIER_INTEGRATION_*` env vars. No push required — works with port-forwarded
APIs too. Set `ZAPIER_INVOKE_DEBUG=true` for verbose output.

**Step 4 — Layer 2 remote invoke (optional, needs ZAPIER_DEPLOY_KEY):**

```bash
cd packages/zapier-app

# 1. Push a snapshot to Zapier
pnpm run test:invoke-push     # builds + pushes 0.0.0-<whoami>

# 2. Create an auth connection on Zapier (one-time)
#    Go to https://zapier.com/app/assets/connections
#    Click "Add Connection", search for "RiskSmart", select your dev version
#    Enter your client key, client secret, and API base URL
#    Give it a name like "RiskSmart <YourName> Local"

# 3. Find your authentication ID
DEPLOY_KEY=$(python3 -c "import json; print(json.load(open('$HOME/.zapierrc'))['deployKey'])")
curl -s -H "X-Deploy-Key: $DEPLOY_KEY" \
  "https://zapier.com/api/platform/cli/apps/236769/authentications" | python3 -m json.tool
# Look for the "id" field next to your connection name

# 4. Run remote tests with your auth ID
ZAPIER_INVOKE_AUTH_ID=<your-auth-id> pnpm run test:invoke-remote
```

Runs 4 search tests on Zapier's actual servers against your pushed snapshot.
API must be publicly reachable from Zapier (no port-forwarding).
Auth test is skipped in remote mode (Zapier handles auth internally).

### CI/CD Pipeline

The Zapier app (ID 236769) is a **single global app** on Zapier's platform —
you can't push different code per environment. The environment is determined by
the auth connection's API base URL. The pipeline pushes once and validates per
environment.

#### PR (pre-merge)

`ZapierAppTest` + `ZapierIntegrationTest` in `auto-pre-merge-app-checks.yml`,
gated on zapier/external-api file changes. Each PR pushes an isolated snapshot
(`0.0.0-pr-{N}`) — no conflicts between PRs.

#### Merge to main (dev-cloud)

`ZapierAppPush` in `auto-post-merge-app-deploy-dev-cloud.yml` — builds and
pushes the permanent version (from `src/index.ts`) to Zapier. Independent of
other jobs; no change detection (dev-cloud deploys everything on merge).

#### Staging deploy

`ZapierAppValidate` in `manual-app-deploy-staging.yml` — runs integration tests
(Layer 1 + Layer 2) against staging API. **No push** — the version is already on
Zapier from the dev-cloud merge.

#### Prod deploy

`ZapierAppPromote` in `manual-app-deploy-prod.yml` — runs integration tests
(Layer 1 + Layer 2) against prod API, then promotes the version so it becomes
the default for all Zapier users.

#### Per-environment GitHub secrets

| Secret | staging | prod | Notes |
|--------|---------|------|-------|
| `ZAPIER_DEPLOY_KEY` | Same key | Same key | Single Zapier account, shared |
| `ZAPIER_INTEGRATION_CLIENT_KEY` | staging key | prod key | External API client creds |
| `ZAPIER_INTEGRATION_CLIENT_SECRET` | staging secret | prod secret | External API client creds |
| `ZAPIER_INTEGRATION_API_BASE_URL` | staging URL | prod URL | Per-env API URL |
| `ZAPIER_INTEGRATION_OWNER_ID` | staging user ID | prod user ID | Valid user in that tenant |
| `ZAPIER_INVOKE_AUTH_ID` | staging auth conn ID | prod auth conn ID | Integer, per-env |

Each environment needs a Zapier auth connection at https://zapier.com/app/assets/connections.
To find auth connection IDs:
```bash
DEPLOY_KEY=$(python3 -c "import json; print(json.load(open('$HOME/.zapierrc'))['deployKey'])")
curl -s -H "X-Deploy-Key: $DEPLOY_KEY" \
  "https://zapier.com/api/platform/cli/apps/236769/authentications" | python3 -m json.tool
```

## Dependencies

- `zapier-platform-core` — Zapier runtime

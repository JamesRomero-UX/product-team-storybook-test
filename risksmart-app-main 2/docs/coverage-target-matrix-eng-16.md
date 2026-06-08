# Coverage Target Matrix — ENG-16

Per-package coverage targets for the test coverage initiative (ENG-3). Short-term targets are achievable within the initiative timeframe. Long-term targets are aspirational and will be ratcheted toward quarterly.

## Target Philosophy

| Package Type | Short-term Stmts | Long-term Stmts | Rationale |
|-------------|-----------------|----------------|-----------|
| Business Logic | Current + 10-15% | 90% | Core domain logic — highest value to test |
| UI (presentational) | Current + 5-10% | 65% | Diminishing returns above 65% for pure presentational code |
| UI (mixed/business logic) | Current + 10-15% | 80% | UI packages with leaked business logic need higher coverage |
| UI (deprecated) | Hold the line | N/A | No new investment — tests migrate with the code |
| Infrastructure | Current + 5% | 50% | Config/plumbing — integration tests more valuable |
| Integration/Adapter | Current + 10% | 70% | Boundary code — mock-free tests at boundaries |

## Coverage Target Matrix

### Packages with existing coverage data

| Package | Type | Current Stmts | Current Floor | Short-term Target | Long-term Target |
|---------|------|--------------|---------------|-------------------|-----------------|
| `packages/web` | UI (mixed) | 48.6% | 46% | 60% | 80% |
| `packages/atomic-ui` | UI (presentational) | 100% | 98% | 98% | 98% |
| `packages/trpc` | Business Logic | 14.4% | 13% | 30% | 90% |
| `packages/components` | UI (deprecated) | 75.8% | — | 75% | N/A |
| `packages/external-api` | Integration/Adapter | 89.9% | 85% | 85% | 90% |
| `packages/rest-api` | Integration/Adapter | 50.4% | — | 55% | 70% |
| `services/permissions` | Integration/Adapter | 91.0% | 85% | 85% | 90% |
| `services/data-layer` | Infrastructure | 77.7% | 70% | 75% | 80% |
| `services/rulebook-ingestion` | Business Logic | 50.6% | 45% | 60% | 80% |
| `services/ai-feedback-ingestion` | Integration/Adapter | 51.3% | 40% | 55% | 70% |
| `services/tenant-configuration` | Integration/Adapter | 8.5% | 5% | 20% | 50% |
| `services/request-state-api` | Business Logic | — | — | 30% | 70% |

### Packages without coverage infrastructure (need `@vitest/coverage-v8`)

| Package | Type | Test Files | Short-term Target | Long-term Target |
|---------|------|-----------|-------------------|-----------------|
| `packages/drizzle` | Infrastructure | 1 | 30% | 50% |
| `packages/schedule-state` | Business Logic | 9 | 70% | 90% |
| `packages/shared` | Business Logic | 7 | 50% | 80% |
| `packages/form-configuration` | Business Logic | 3 | 50% | 80% |
| `packages/data-import` | Business Logic | 7 | 50% | 70% |
| `packages/zapier-app` | Integration/Adapter | 21 | 50% | 70% |
| `packages/scim-api` | Integration/Adapter | 13 | 50% | 70% |
| `packages/permitio` | Infrastructure | 3 | 30% | 50% |
| `packages/i18n` | Infrastructure | 2 | 30% | 50% |
| `packages/auth` | Infrastructure | 1 | N/A | N/A |
| `packages/knock` | Infrastructure | 1 | N/A | N/A |

## Notes

### Packages excluded from coverage targets

- **`packages/auth`** — Auth0 action scripts run in a sandboxed Auth0 runtime; no testable TypeScript logic
- **`packages/knock`** — Liquid templates + workflow JSON; no testable TypeScript logic

### Special considerations

1. **`packages/web` — UI with leaked business logic.** The web package is classified as "UI (mixed)" rather than pure UI because significant business logic leaked into presentational layers during early development (data transforms, conditional workflows, permission gates, form validation). A 65% target would leave critical logic paths untested. The 80% long-term target reflects that this package needs coverage parity closer to a business logic package. As business logic is extracted to `packages/trpc` services over time, the web package will trend toward pure UI and the target can be revisited.

2. **`packages/components` — deprecated, hold the line.** This package will eventually be deprecated and migrated to `packages/atomic-ui` or another suitable package. No new test investment should go here. The short-term target (75%) prevents regression on existing tests, but there is no long-term target. When components are migrated, their tests should migrate with them to the destination package.

3. **`packages/trpc`** — The 14.4% -> 90% jump is the largest gap. Priority should be service-layer tests (`src/services/frontend/`), not router tests. Router tests should be kept minimal (see ENG-15 audit).

4. **`packages/rest-api`** — Being replaced by tRPC. Short-term target is conservative (55%) since new tests should go into tRPC service layer, not rest-api. Long-term target assumes the migration reduces the package significantly.

5. **`services/rulebook-ingestion`** — Clean architecture with separate `domain/` and `adaptors/` layers. Coverage should focus on `domain/` + `use-cases/` (target 90%), while `adaptors/` layer can be lower (60%).

6. **`services/request-state-api`** — Has 3 pre-existing test failures that need fixing before coverage can be measured.

7. **`packages/components`** and **`packages/rest-api`** — Cannot currently have vitest.config.ts files added without breaking test discovery. Need investigation before thresholds can be enforced (see ENG-17 notes).

8. **`packages/data-import`** — Runs as a CLI against a live database. Integration testing is more meaningful than unit testing; 70% long-term with integration tests supplementing.

## Ratcheting Strategy

Thresholds will be ratcheted quarterly:
1. Measure current coverage at start of quarter
2. Set threshold to `max(current - 2%, previous threshold)` — prevents regression while allowing small fluctuations
3. If current exceeds short-term target, move threshold to `current - 2%`
4. Review long-term targets annually

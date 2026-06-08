# Test Coverage Baseline — March 2026

Baseline coverage audit for ENG-3. All numbers measured on 2026-03-05 using Vitest v3.2.4 with V8 coverage provider.

## Coverage Summary

### Packages with coverage data

| Package | Stmts % | Branch % | Funcs % | Test Files | Coverage Threshold | Has `@vitest/coverage-v8` |
|---------|---------|----------|---------|------------|-------------------|--------------------------|
| packages/web | 48.6 | 75.5 | 48.2 | 323 | Yes (46/74/46/46) | Yes |
| packages/atomic-ui | 100.0 | 100.0 | 100.0 | 5 | Yes (98/98/98/98) | Yes |
| packages/trpc | 14.4 | 69.9 | 24.3 | 11 | No | Yes |
| packages/components | 75.8 | 79.0 | 64.5 | 27 | No | Yes |
| packages/external-api | 89.9 | 94.4 | 82.5 | 103 | No | Yes |
| packages/rest-api | 50.4 | 81.5 | 51.3 | 165 | No | Yes |
| services/permissions | 91.0 | 92.3 | 80.5 | 20 | No | Yes |
| services/data-layer | 77.7 | 84.4 | 56.5 | 24 | No | Yes |
| services/rulebook-ingestion | 50.6 | 74.8 | 77.4 | 11 | No | Yes |
| services/ai-feedback-ingestion | 51.3 | 75.0 | 66.7 | 3 | No | Yes |
| services/tenant-configuration | 8.5 | 76.5 | 69.2 | 2 | No | Yes |
| services/request-state-api | — | — | — | 8 | No | Yes |
| packages/third-party-portal | — | — | — | — | No | Yes |
| packages/local-auth-provider | — | — | — | 0 | No | Yes |

— = Coverage could not be measured due to pre-existing test failures.

### Packages without `@vitest/coverage-v8`

These packages have unit tests but no coverage infrastructure:

| Package | Test Files | Notes |
|---------|------------|-------|
| packages/drizzle | 1 | Core DB layer — critical gap |
| packages/zapier-app | 21 | Has contract validation tests |
| packages/scim-api | 13 | SCIM integration |
| packages/schedule-state | 9 | State machine logic |
| packages/shared | 7 | Shared utilities |
| packages/data-import | 7 | Import pipeline |
| packages/permitio | 3 | Permission config |
| packages/form-configuration | 3 | Form logic |
| packages/i18n | 2 | Internationalisation |
| packages/auth | 1 | Auth0 actions |
| packages/knock | 1 | Notification workflows |

### Integration/E2E test packages (separate from unit coverage)

| Package | Test Files | Type |
|---------|------------|------|
| packages/e2e | 60 | Playwright E2E |
| packages/api-tests | — | Hasura GraphQL integration |
| packages/trpc-api-tests | 60 | tRPC integration (Docker) |
| packages/external-api-tests | — | External API integration |

## Pre-existing Issues Found

1. **services/request-state-api**: 3 test file failures (need investigation)

## Key Observations

1. **Only 2 of 14 coverage-capable packages enforce thresholds** (web, atomic-ui)
2. **packages/trpc is the biggest gap** — 14.4% statement coverage with only 11 test files for the entire business logic layer (253 source files)
3. **services/tenant-configuration** has very low coverage (8.5%) with only 2 test files
4. **11 packages lack coverage infrastructure entirely** (no `@vitest/coverage-v8`)
5. **services/permissions and data-layer** have surprisingly good coverage (91% and 77.7%) despite no thresholds
6. **packages/components** at 75.8% is a solid base to build on
7. **Total of ~870 unit/integration test files** across the monorepo, heavily concentrated in web (323), rest-api (165), and external-api (103)

## Recommended Threshold Floors

Based on current coverage, these thresholds would prevent regression without failing builds:

| Package | Recommended Floor (Stmts) | Notes |
|---------|--------------------------|-------|
| packages/web | 46 (existing) | Already enforced |
| packages/atomic-ui | 98 (existing) | Already enforced |
| packages/trpc | 14 | Very low — raise after adding tests |
| packages/components | 70 | Good base, floor just below current |
| services/permissions | 85 | Strong coverage, set high floor |
| services/data-layer | 70 | Good coverage, conservative floor |
| services/rulebook-ingestion | 45 | Moderate coverage |
| services/ai-feedback-ingestion | 45 | Moderate coverage |
| packages/external-api | 85 | Strong coverage, set high floor |
| packages/rest-api | 45 | Moderate coverage |
| services/tenant-configuration | 5 | Very low — raise after adding tests |

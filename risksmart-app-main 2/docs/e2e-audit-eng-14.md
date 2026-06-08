# E2E Test Audit — ENG-14

Audit of 60 Playwright E2E test files in `packages/e2e/tests/` to identify tests that should be replaced by unit/integration tests.

## Summary

| Category | Files | Est. Test Cases | Action |
|----------|-------|----------------|--------|
| **KEEP** | 14 | ~85 | No change needed |
| **SIMPLIFY** | 22 | ~175 | Trim CRUD tests, keep cross-entity/workflow tests |
| **REPLACE** | 24 | ~200 | Move to unit/integration tests, then remove |

**Estimated CI time savings**: Removing ~200 REPLACE tests and trimming ~80 CRUD tests from SIMPLIFY files could reduce the E2E suite by ~50%, bringing CI from ~17 min to ~8-10 min.

## Key Findings

### 1. Issue variant duplication is the biggest win

Seven files (`issueBreaches`, `issueConsumerDuties`, `issueCustomerTrusts`, `issueGDPRBreaches`, `issuePCIBreaches`, `issueRiskEvents`, `issueSAR`) are structurally identical — only the `variant` constant differs. They collectively run ~112 near-duplicate tests. A single parameterised unit test on the variant labelling logic would replace all seven files.

### 2. Boilerplate CRUD pattern appears in nearly every file

Almost every entity file has 2-3 per-role heading tests, a basic create test, and a basic delete test. These are form submission + table assertion patterns that belong in integration tests.

### 3. Form configuration tests are legitimate E2E

The form-configuration system (custom labels, conditional fields, required/unrequired toggles) involves multi-step modal interaction and cross-page propagation. These tests genuinely need a browser.

### 4. Cross-entity workflows should stay

Tests involving computed columns (trend indicators, risk scores, next-test-date propagation), approval workflows, and multi-entity linking are the right use of E2E.

## Missing E2E coverage (complex workflows not tested)

- **Permissions/ABAC flow**: No E2E tests for contributor vs owner access restrictions on shared entities
- **Bulk operations**: No tests for multi-select actions on registers (bulk delete, bulk tag, bulk assign)
- **Data import end-to-end**: Import CSV -> verify entities created with correct relationships
- **Cross-module navigation**: e.g. Risk -> linked Control -> linked Test Result -> back to Risk
- **Notification workflows**: Action triggers notification -> user sees notification -> clicks through to entity
- **Concurrent editing**: Two users editing the same entity (optimistic locking)
- **Search/filter combinations**: Complex filter chains with custom attributes across registers

## Full Audit Table

### KEEP (14 files)

| File | Tests | Reason |
|------|-------|--------|
| `approvals.spec.ts` | 2 | Complex multi-step approval workflow: settings -> action -> change request -> Lambda -> status verification |
| `chat.spec.ts` | 4 | UI interaction tests: side panel toggle, send-button state, loading states |
| `colourSettings.spec.ts` | 2 | Highcharts chart fill attribute matching saved colour hex — visual/DOM behaviour |
| `customAttributes.spec.ts` | ~30 | Cross-cutting: field config -> register -> CSV export -> change-request diff -> CDS. Most feature-rich file |
| `customDatasources.spec.ts` | 15 | Query-builder with joins, left-joins, filtering, child/parent traversal, multi-entity rollup |
| `dashboard.spec.ts` | 10 | Drag-and-drop widget placement, dashboard toggling, widget lifecycle |
| `documentVersions.spec.ts` | 5 | Multi-step approval workflow with conditional fields and feature-flag gating |
| `enterpriseRisk.spec.ts` | 9 | Cross-entity copy (NZ + AU), table-state persistence (sort/filter/columns across navigation) |
| `internalAuditReports.spec.ts` | 9 | Cross-entity workflows, feature flag interactions, conditional fields |
| `rcsa.spec.ts` | 2 | Multi-step RCSA wizard: assessment -> risk -> link via wizard -> cascade delete |
| `requests.spec.ts` | 2 | End-to-end approval workflow with user group approvers |
| `taxonomy.spec.ts` | 4 | Role-based tab visibility, custom translation propagation, external URL navigation |
| `trendIndicators.spec.ts` | 6 | Computed trend columns spanning DB aggregation, scoring pipeline, and UI |
| `visual.spec.ts` | 3 | Screenshot regression tests — require real browser by definition |
| `thirdPartyQuestionnaireVersion.spec.ts` | 2 | Complex form-builder UI journey with multi-section, multi-field types |

### SIMPLIFY (22 files)

Keep cross-entity/workflow tests, remove CRUD boilerplate.

| File | Tests | Keep | Remove | Key tests to keep |
|------|-------|------|--------|------------------|
| `acceptances.spec.ts` | 12 | 4 | 8 | Approval workflow, conditional fields, custom-label propagation |
| `actions.spec.ts` | 10 | 5 | 5 | Cross-entity "add action from risk", field-renaming/CDS propagation, form-config |
| `activities.spec.ts` | 6 | 3 | 3 | Form-config modal tests, conditional fields |
| `appetites.spec.ts` | 10 | 5 | 5 | Appetite-performance calculation (Inside/Outside), form-config propagation |
| `assessments.spec.ts` | 10 | 5 | 5 | Configuration propagation, conditional fields |
| `causes.spec.ts` | 9 | 4 | 5 | Field relabelling in register/CDS, form-settings modal |
| `complianceAssessment.spec.ts` | 7 | 3 | 4 | Cross-register isolation, field-label propagation |
| `consequences.spec.ts` | 8 | 5 | 3 | Form-config tests, cross-page propagation |
| `controls.spec.ts` | 9 | 5 | 4 | Next-test-date scheduling, cross-entity linking, form-config |
| `dataImporter.spec.ts` | 7 | 4 | 3 | Upload/validation/status tests (keep), CSV header tests (replace) |
| `documents.spec.ts` | 7 | 4 | 3 | Next-test-date logic, conditional fields |
| `impactRatings.spec.ts` | 3 | 1 | 2 | Archiving business logic |
| `impacts.spec.ts` | 3 | 1 | 2 | Schema-driven column renaming propagation |
| `indicators.spec.ts` | 8 | 3 | 5 | Next-test-date update, register refresh after delete |
| `internalAudit.spec.ts` | 7 | 4 | 3 | Conditional fields with required-field lock |
| `issueAssessment.spec.ts` | 5 | 2 | 3 | Cross-entity policy breaches in register |
| `issues.spec.ts` | ~25 | 8 | 17 | Custom field matrix, approval workflow for delete, conditional fields |
| `obligations.spec.ts` | 10 | 6 | 4 | Rating-date propagation, multi-context permission, conditional fields |
| `riskDashboard.spec.ts` | 3 | 1 | 2 | Add Tier 1 shown in dashboard |
| `riskRatings.spec.ts` | 9 | 2 | 7 | Scoring model tests (Default + ControlEffectivenessAverages) |
| `risks.spec.ts` | 25 | 8 | 17 | Sort/filter state persistence, linked-items workflow, CDS integration |
| `testResults.spec.ts` | 8 | 3 | 5 | Overall effectiveness manual value preservation, custom field rename |
| `thirdParty.spec.ts` | 7 | 2 | 5 | Full create+verify round-trip, conditional field visibility |
| `automations.spec.ts` | 4 | 2 | 2 | Feature-flag gating tests |

### REPLACE (24 files)

These should be entirely replaced by unit/integration tests.

| File | Tests | Reason |
|------|-------|--------|
| `actionsUpdates.spec.ts` | 1 | Single CRUD test: create action + add update |
| `controlGroups.spec.ts` | 1 | Single test: navigate + assert page title |
| `customRibbon.spec.ts` | 1 | Single test: open ribbon modal + click save |
| `departments.spec.ts` | 3 | Isolated CRUD in Settings modal |
| `entity.spec.ts` | 1 | Single test: fill entity form in Settings |
| `findings.spec.ts` | 2 | Page-title assertions for two roles |
| `globalHeader.spec.ts` | 11 | Hedged with if/else fallbacks making tests no-ops; breadcrumb/clipboard mockable |
| `issueBreaches.spec.ts` | ~16 | Variant duplicate of issues.spec.ts (variant="Breach") |
| `issueConsumerDuties.spec.ts` | ~16 | Variant duplicate (variant="Consumer duty") |
| `issueCustomerTrusts.spec.ts` | ~16 | Variant duplicate (variant="Customer trust") |
| `issueGDPRBreaches.spec.ts` | ~16 | Variant duplicate (variant="GDPR breach") |
| `issuePCIBreaches.spec.ts` | ~16 | Variant duplicate (variant="PCI breach") |
| `issueRiskEvents.spec.ts` | ~16 | Variant duplicate (variant="Risk event") |
| `issueSAR.spec.ts` | ~16 | Variant duplicate (variant="SAR") |
| `issueUpdates.spec.ts` | 1 | Single CRUD test: create issue + add update |
| `moduleSettings.spec.ts` | 1 | Single test: navigate + assert heading |
| `obligationImpacts.spec.ts` | 3 | Isolated sub-entity CRUD |
| `policyRatings.spec.ts` | 5 | CRUD + form-config already tested more thoroughly elsewhere |
| `tags.spec.ts` | 3 | Pure CRUD for settings entity |
| `thirdPartyQuestionnaire.spec.ts` | 3 | Single-entity CRUD |
| `userGroups.spec.ts` | 2 | Basic CRUD for Groups settings |

## Recommended Actions

### Phase 1: Quick wins (highest impact, lowest effort)

1. **Delete 7 issue-variant files** and replace with a single parameterised unit test on variant labelling logic (~112 tests -> ~7 unit tests)
2. **Delete single-test files** (`actionsUpdates`, `controlGroups`, `customRibbon`, `entity`, `moduleSettings`, `issueUpdates`) — 6 tests total, trivially covered by integration tests
3. **Delete heading-only tests** (`findings`, `globalHeader`) — assertions have no meaningful business value

### Phase 2: Integration test migration

4. **Replace remaining REPLACE files** (`departments`, `obligationImpacts`, `policyRatings`, `tags`, `thirdPartyQuestionnaire`, `userGroups`) with tRPC/data-layer integration tests
5. **Trim SIMPLIFY files** — remove CRUD tests from each, keeping only cross-entity and form-config tests

### Phase 3: Fill gaps

6. **Add missing cross-entity E2E tests** for permissions/ABAC, bulk operations, and notification workflows

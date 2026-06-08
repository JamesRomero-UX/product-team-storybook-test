# Scoring Settings: Frontend Migration Plan (Granular Iterations)

> Replaces PR 5 and PR 6 from the original migration plan (`migration-taxonomy-ratings-to-scoring-config.md`). PR 7 (Reporting — syncing `risk_rating_definition` table) is a separate backend-only change and is NOT part of this work.

## Progress

| Iteration | Description | Status | Files Changed |
|-----------|-------------|--------|---------------|
| 0 | Core infrastructure | Done | `useScoringSettings.ts`, `useScoringSettings.test.tsx` |
| 1 | Risk rating calculation hook | Done | `useCalculateRiskRating.ts`, `useCalculateRiskRating.test.tsx` |
| 2 | Risk score formatters | Done | `useRiskScore.tsx` |
| 3 | Risk score badge component | Done | `RiskScoreBadge.tsx` |
| 4 | Risk register rating & impact/likelihood columns | Done | `config.tsx` (risks) |
| 5 | Assessment form L/I/Rating dropdowns | Done | `ControlledRating.tsx`, `RiskAssessmentResultFormFields.tsx` |
| 6 | Rating history sparklines | Done | `types.ts`, `useGetLabelledFields.tsx`, `config.tsx` (risks) |
| 7 | Assessment result tables (3 types) | Done | 3 config + 3 labelled fields files |
| 8 | Assessment result exports | Done | `useExportAssessmentDetails.ts`, `useExportComplianceMonitoringDetails.ts`, `useExportInternalAuditDetails.ts` |
| 9 | Cross-entity assessment results | Done | `assessments/results/config.tsx`, `assessments/results/useLabelledFields.tsx`, `assessments/update/tabs/results/config.tsx`, `assessments/update/tabs/results/useLabelledFields.tsx`, `useAssessmentResultExportTable.ts` |
| 10 | Compliance monitoring results | Done | `compliance/monitoring-assessments/results/config.tsx`, `results/useLabelledFields.tsx`, `results/update/results/config.tsx`, `results/update/results/useLabelledFields.tsx`, `update/useAssessmentResultExportTable.ts`, `internal-audit/reports/update/useAssessmentResultExportTable.ts` |
| 11 | Heatmap grid dimensions + axis labels | Done (PR #5658) | `useGetRiskAssessmentRatingsData.ts`, `RiskHeatmap.tsx`, `HeatmapWidget.tsx` |
| 12 | Dashboard cards | Done (PR #5658) | `SelectedRiskAttribute.tsx` |
| 13 | Appetites | Done (PR #5660) | `appetite.query.ts`, `getActiveRiskAppetites.graphql`, `appetites/types.ts`, `appetites/useLabelledFields.tsx`, `appetites/config.tsx` |
| 14 | Latest risk ratings preview | Done (automatic) | No code — inherited from Iteration 2 |
| 15 | Ratings over time widget | Done (PR #5666) | `RiskRatingsOverTime.tsx` |
| 16 | Universal dashboard widgets | Done (PR #5666) | `risk.ts` (universal widget data source) |

**Additional work done outside iterations:**
- Heatmap bug fixes (`HeatmapWidget.tsx`) — fixed `chart.update()` issues with data labels and tooltips caused by Iteration 1 changes to `useCalculateRiskRating`. Not the same as Iteration 11 (grid dimensions + axis labels from scoring settings).
- Added `useScoringSettings` mock to `RiskHeatmap.test.tsx`.
- E2e tests for compliance monitoring and internal audit findings registers, including scoring settings label verification. Consolidated findings and ratings tests by label source (taxonomy vs scoring settings).
- Heatmap click-through filters (`useGetLabelledFields.tsx`) — use `resolveImpact`/`resolveLikelihood` from `useRiskRatingResolver` with taxonomy fallback so heatmap cell click-throughs match risk register filter labels.
- Resolver cleanup (`useRiskRatingResolver.ts`) — populate `options.likelihood`/`options.impact` with taxonomy fallback when no scoring settings; consolidate duplicate `useRating` calls.

---

## Guiding Principles

- **No behavioral change** when an org does NOT have scoring settings configured. Taxonomy fallback is preserved.
- **Each iteration is independently shippable** — no iteration leaves the app in a broken state.
- **Scoring settings matrix lookup is always by likelihood + impact** — never by value, because cells with the same value can have different labels/colors.

---

## Iteration 0: Core Infrastructure (No Visible Change)

### What this is
Add lookup functions to the existing `useScoringSettings` hook. This is purely additive — no consumers yet, no UI change, no behavioral change.

### Why
Every subsequent iteration needs a way to look up a matrix cell by likelihood + impact. Building this once avoids duplicating the logic everywhere.

### Changes
- **`packages/web/src/ratings/useScoringSettings.ts`** — Add:
  - `getByLikelihoodAndImpact(likelihood, impact)` — O(1) Map-based matrix cell lookup
  - `getLikelihoodByValue(value)` — find a likelihood level by its value
  - `getImpactByValue(value)` — find an impact level by its value
- Unit tests for the new lookup functions

### Risk: None — no consumers, purely additive.

---

## Iteration 1: Risk Rating Calculation Hook

### What this is
The core hook (`useCalculateRiskRating`) that calculates a risk rating from a likelihood/impact pair. Used by assessment forms, the heatmap, and score badges.

### What the user sees
When an assessment is created or a score badge is displayed, this hook determines what rating (e.g. "High", "Medium") corresponds to a given likelihood + impact combination.

### Why it works well
This hook already receives likelihood and impact as its input parameters — it's the most natural fit for the new lookup.

### Current behavior
Reads from `useRating('risk_controlled'/'risk_uncontrolled')` taxonomy, matches by `likelihoodImpact` array or falls back to range-based matching.

### Changes
- **`packages/web/src/ratings/useCalculateRiskRating.ts`** — When scoring settings config exists, use `getByLikelihoodAndImpact()` from Iteration 0. Fall back to existing taxonomy logic when no config. The `controlType` parameter (controlled vs uncontrolled) is ignored when using scoring settings since the matrix is the same for both.

### Risk: Low — isolated hook, input params already have L/I.

---

## Iteration 2: Risk Score Formatters

### What this is
The `useRiskScoreFormatters` hook provides functions to display a risk score as a colored badge with label. It's the most widely used rating display mechanism — ~15 different files call it.

### What the user sees
Every colored rating badge on the risk register, assessments, exports, dashboards, and appetite tables flows through this hook.

### Why it matters
This is the highest-leverage single change. Fixing this hook means ~15 consumer files potentially get the right behavior with minimal further changes (assuming they pass likelihood/impact in their data).

### Current behavior
Calls `useRating('risk_controlled').getByValue` and `useRating('risk_uncontrolled').getByValue` to find a rating by its numeric value.

### The `RiskScore` type already carries L/I
```
inherentLikelihood, inherentImpact, residualLikelihood, residualImpact
```
These fields are populated from the risk score table or the latest assessment result.

### Changes
- **`packages/web/src/hooks/useRiskScore.tsx`** — When scoring settings config exists, `getInherentOption()` uses `getByLikelihoodAndImpact(score.inherentLikelihood, score.inherentImpact)` instead of `getByValue(score.inherentRating)`. Same for residual. Falls back to taxonomy when no config.
- If the caller doesn't provide likelihood/impact (some callers pass only `{ inherentRating }` without L/I), the formatter returns "Unrated" for config orgs. This is acceptable because no orgs have config yet — those call sites get fixed in later iterations.

### Risk: Low — behavioral change only for config orgs (none exist yet).

---

## Iteration 3: Risk Score Badge Component

### What this is
The `RiskScoreBadge` component displayed in risk register score columns.

### What the user sees
In the risk register, columns like "Uncontrolled Score" and "Controlled Score" show a colored badge with the numeric score.

### Current behavior
Receives `impact`, `likelihood`, `rating`, and `score` as props. Uses `useCalculateRiskRating` for the default scoring model and `useRating().getByValue` for non-default models.

### Why it already has L/I
The component already receives impact and likelihood as props from the risk register config.

### Changes
- **`packages/web/src/pages/risks/RiskScoreBadge.tsx`** — When scoring settings exist, use `getByLikelihoodAndImpact` for the lookup. Remove the `getByValue` path for config orgs.

### Risk: Low — component already has all needed data.

---

## Iteration 4: Risk Register Rating & Impact/Likelihood Columns

### What this is
The "Uncontrolled Rating" and "Controlled Rating" columns in the risk register table, plus their PDF/CSV export styling. Also the Impact and Likelihood text label columns (e.g. "Controlled Impact", "Uncontrolled Likelihood").

### What the user sees
Colored badges in the risk register table showing the inherent/residual rating label (e.g. "High" in red). Also affects PDF export cell coloring. Impact and Likelihood columns show text labels from scoring settings (e.g. "Significant", "Expected") instead of taxonomy labels.

### Current behavior
Rating badges call `riskScoreFormatters({ inherentRating: item.UncontrolledRating }).getInherentRatingBadge()` — passes only the rating value, not likelihood/impact. Impact/Likelihood text columns use `getImpactByValue`/`getLikelihoodByValue` from taxonomy `useRating` hook.

### Why it's easy
The table item (`RiskRegisterFields`) already has `UncontrolledLikelihoodValue`, `UncontrolledImpactValue`, `ControlledLikelihoodValue`, `ControlledImpactValue`. We just need to pass them.

### Changes
- **`packages/web/src/pages/risks/config.tsx`** — Update ~6 `riskScoreFormatters()` calls to also pass likelihood/impact from the item. Example:
  ```
  riskScoreFormatters({
    inherentRating: item.UncontrolledRating,
    inherentLikelihood: item.UncontrolledLikelihoodValue,
    inherentImpact: item.UncontrolledImpactValue,
  })
  ```
- **`packages/web/src/pages/risks/config.tsx`** — Add `useScoringSettings` hook and `resolveImpact`/`resolveLikelihood` helpers to update ~8 impact/likelihood text label columns. When scoring settings are configured, uses `getImpactByValue`/`getLikelihoodByValue` from scoring settings; otherwise falls back to taxonomy `useRating` lookups.

### Depends on: Iteration 0, Iteration 2

---

## Iteration 5: Risk Assessment Form — Likelihood & Impact Dropdowns

### What this is
The form where users select likelihood and impact values when creating or editing a risk assessment result. This is the **input** side — all other iterations handle display/output.

### What the user sees
When adding or editing a risk rating (standard, compliance monitoring, or internal audit), the form shows dropdown selectors for Likelihood and Impact. Currently these options come from i18n taxonomy. When scoring settings are configured, the dropdowns should show the likelihood and impact levels defined in the config.

### Current behavior
`RiskAssessmentResultFormFields.tsx` renders two `ControlledRating` components with `type="likelihood"` and `type="impact"`. `ControlledRating` internally calls `useRating(type)` which sources options from i18n translation files (`ratings.json`).

### Data flow
```
RiskAssessmentResultFormFields.tsx
  → ControlledRating (type="likelihood" / type="impact")
    → useGetOptions(type) → useRating(type) → i18n taxonomy
```

### Why it matters
Without this change, orgs with scoring settings would see taxonomy-based options in the form but scoring-settings-based labels everywhere else. The form must present the same levels that the matrix uses.

### All three assessment modes are affected
Standard, compliance monitoring, and internal audit risk assessment forms all delegate to `RiskAssessmentResultFormFields.tsx`, so a single change covers all three.

### Changes
- **`packages/web/src/components/form/controlled-rating/ControlledRating.tsx`** — Add an optional `overrideOptions?: RatingOption[]` prop. When provided, these options are used instead of the taxonomy-sourced options from `useRating()`. The hook is still called unconditionally (React rules of hooks), but the override takes precedence.
- **`packages/web/src/pages/assessments/forms/RiskAssessmentResultFormFields.tsx`** — When scoring settings are configured, pass scoring settings options to all three `ControlledRating` fields:
  - **Likelihood** dropdown → `likelihoodOptions` from scoring settings
  - **Impact** dropdown → `impactOptions` from scoring settings
  - **Rating** dropdown → `ratingLevelOptions` (distinct rating levels deduplicated from matrix cells, sorted by value)
- **`packages/web/src/ratings/useScoringSettings.ts`** — Add `ratingLevelOptions` — the distinct set of rating levels from the matrix (deduplicated by value, sorted ascending). Needed because `matrixOptions` has one entry per cell (e.g., 25 for a 5x5 grid), but the Rating dropdown needs just the unique levels (e.g., Low, Medium, High, Critical).

### Also consider
- **`packages/web/src/pages/appetites/detail/forms/AppetiteFormFields.tsx`** — Has `LikelihoodAppetite` and `ImpactAppetite` fields using the same `useRating('likelihood')` / `useRating('impact')` pattern. These selectors should also use scoring settings levels when configured. (Related to Iteration 13.)
- **`packages/web/src/pages/impacts/ratings/forms/`** — Impact rating forms also use `useRating('likelihood')` / `useRating('impact')` for their selectors. These are part of the separate "Impacts" feature and may warrant their own iteration if impacts should also respect scoring settings.

### Depends on: Iteration 0

---

## Iteration 6: Risk Register Rating History

### What this is
The rating history "sparkline" columns in the risk register showing the last 6 ratings as small colored badges.

### What the user sees
A row of small colored dots/badges showing how the risk's rating has changed over the last 6 assessments.

### Current behavior
Each history item is `{ rating, id, testDate }`. The rating value is looked up via `getByValue` to get its label and color.

### Why it needs data enrichment
The history items currently DON'T include likelihood/impact — they're stripped out when the data is mapped. But the source data (GraphQL `assessmentResults[].riskAssessmentResult`) DOES have `Likelihood` and `Impact` fields.

### Changes
1. **`packages/web/src/pages/risks/useGetLabelledFields.tsx`** — Update `getRatingHistory()` to include `likelihood` and `impact` from `riskAssessmentResult`
2. **`packages/web/src/pages/risks/types.ts`** — Add `likelihood?: number | null` and `impact?: number | null` to the history item type
3. **`packages/web/src/pages/risks/config.tsx`** — Update history badge rendering to use L/I lookup

### Product question
**Should historical ratings be resolved against the CURRENT matrix?** If the matrix has been reconfigured since the assessment was created, the L/I pair may produce a different label/color than what was originally shown. This is actually the correct behavior (the rating value stored on the assessment IS the product of the matrix at the time, but the label/color should reflect the current configuration).

### Depends on: Iteration 0

---

## Iteration 7: Risk Assessment Result Tables (3 Assessment Types)

### What this is
The tables showing individual assessment results under a risk, split across three assessment modes: standard risk assessments, compliance monitoring assessments, and internal audit assessments.

### What the user sees
When viewing a risk and navigating to its assessments tab, tables show each assessment result with its Rating, Likelihood, Impact, and Status.

### Current behavior
Uses `getByValue(item.Rating)` from `useRating('risk_controlled'/'risk_uncontrolled')` to look up rating display info.

### Why it's straightforward
Each assessment result row already has `Rating`, `Impact`, and `Likelihood` fields available. We just need to use L/I for the lookup instead of the value.

### Changes (6 files, same pattern)
- **`packages/web/src/pages/risks/update/tabs/assessments/riskRatingConfig.tsx`**
- **`packages/web/src/pages/risks/update/tabs/assessments/complianceRatingConfig.tsx`**
- **`packages/web/src/pages/risks/update/tabs/assessments/internalAuditRatingConfig.tsx`**
- **`packages/web/src/pages/risks/update/tabs/assessments/useRiskRatingLabelledFields.tsx`**
- **`packages/web/src/pages/risks/update/tabs/assessments/useComplianceRatingLabelledFields.tsx`**
- **`packages/web/src/pages/risks/update/tabs/assessments/useInternalAuditRatingLabelledFields.tsx`**

### Depends on: Iteration 0

---

## Iteration 8: Assessment Result Exports

### What this is
PDF/CSV export of assessment results showing rating labels.

### What the user sees
Downloaded export files with the rating label (e.g. "High") in the Rating column.

### Current behavior
Uses `getLabel(au.Rating)` from `useRating('risk_controlled'/'risk_uncontrolled')`.

### Why it's straightforward
The export data has `Rating`, `Impact`, and `Likelihood` for each record.

### Changes
- **`packages/web/src/pages/risks/update/useExportComplianceMonitoringDetails.ts`**
- **`packages/web/src/pages/risks/update/useExportInternalAuditDetails.ts`**

### Depends on: Iteration 0

---

## Iteration 9: Cross-Entity Assessment Results Page

### What this is
The aggregated assessment results pages that show results across multiple entity types (risk, document, obligation, test results).

### What the user sees
A combined table of all assessment results, with rating badges for risk assessment results.

### Current behavior
Uses `getByValue` and `riskScoreFormatters` for risk assessment result types. Document and obligation results use different rating taxonomies (not risk_controlled/risk_uncontrolled).

### Why only risk results are affected
Only `risk_assessment_result` types use the risk matrix ratings. Document/obligation results use their own rating taxonomies.

### Changes
- **`packages/web/src/pages/assessments/results/config.tsx`**
- **`packages/web/src/pages/assessments/results/useLabelledFields.tsx`**
- **`packages/web/src/pages/assessments/update/tabs/results/config.tsx`**
- **`packages/web/src/pages/assessments/update/tabs/results/useLabelledFields.tsx`**
- **`packages/web/src/pages/assessments/update/useAssessmentResultExportTable.ts`**

### Depends on: Iteration 0 (and Iteration 2 for files using riskScoreFormatters)

---

## Iteration 10: Compliance Monitoring Assessment Results

### What this is
Assessment result tables and exports specific to compliance monitoring assessments.

### What the user sees
Tables of second-line assessment results with rating badges, plus PDF/CSV exports.

### Changes
- **`packages/web/src/pages/compliance/monitoring-assessments/results/config.tsx`**
- **`packages/web/src/pages/compliance/monitoring-assessments/results/useLabelledFields.tsx`**
- **`packages/web/src/pages/compliance/monitoring-assessments/results/update/results/config.tsx`**
- **`packages/web/src/pages/compliance/monitoring-assessments/results/update/results/useLabelledFields.tsx`**
- **`packages/web/src/pages/compliance/monitoring-assessments/update/useAssessmentResultExportTable.ts`**
- **`packages/web/src/pages/internal-audit/reports/update/useAssessmentResultExportTable.ts`**

### Depends on: Iteration 0 (and Iteration 2 for files using riskScoreFormatters)

---

## Iteration 11: Risk Heatmap Widget

### What this is
The heatmap on the risk dashboard showing risk distribution across the likelihood x impact matrix.

### What the user sees
A colored grid where rows are likelihood levels, columns are impact levels, and cell colors represent the matrix rating. Each cell shows a count of risks that fall in that position.

### Why it's a natural fit
The heatmap IS the matrix — it's the most direct representation of the scoring settings.

### Current behavior
Grid dimensions come from `useRating('impact').options.length` and `useRating('likelihood').options.length`. Cell colors come from `useCalculateRiskRating`.

### Changes
- **`packages/web/src/pages/dashboards/widgets/risk-heatmap/useGetRiskAssessmentRatingsData.ts`** — When scoring settings exist, use `likelihoodOptions` and `impactOptions` from scoring settings for grid dimensions. Cell colors inherit the fix from Iteration 1 (`useCalculateRiskRating`).
- **`packages/web/src/pages/dashboards/widgets/heatmap-widget/HeatmapWidget.tsx`** — Axis labels currently use `useRating('impact').getLabelByIndex` and `useRating('likelihood').getLabelByIndex`. When scoring settings exist, source axis labels from `impactOptions` and `likelihoodOptions` instead.

### Depends on: Iteration 1

---

## Iteration 12: Risk Dashboard Cards

### What this is
The risk dashboard card view where each risk is displayed as a card with a selected attribute (e.g. controlled rating).

### What the user sees
Cards with a colored rating badge. The user can toggle which attribute is shown (controlled rating, uncontrolled rating, appetite performance, impact performance).

### Current behavior
Uses `getByLabel(data.ControlledRatingLabelled)` to find the rating option from the label string.

### Why it has L/I
The card data is `RiskRegisterFields` which has `ControlledLikelihoodValue`, `ControlledImpactValue`, etc.

### Changes
- **`packages/web/src/pages/risk-dashboard/SelectedRiskAttribute.tsx`** — When scoring settings exist, use L/I lookup instead of `getByLabel`.

### Depends on: Iteration 0

---

## Iteration 13: Appetites

### What this is
The appetite register showing controlled rating alongside appetite thresholds.

### What the user sees
A table with each risk's appetite, showing the risk's controlled (residual) rating, the lower/upper appetite thresholds, and the performance status.

### Current behavior
The controlled rating is looked up via `riskScoreFormatters({ residualRating })`. The appetite config uses `getByLabel(item.ControlledRatingLabelled)`.

### Why it needs GraphQL enrichment
The GraphQL query (`getActiveRiskAppetites`) fetches `riskScore` with `InherentRating`, `ResidualRating`, `InherentScore`, `ResidualScore` — but does NOT fetch `ResidualLikelihood`, `ResidualImpact`, `InherentLikelihood`, `InherentImpact`.

### Changes
1. **`packages/web-graphql-client/graphql/appetite/getActiveRiskAppetites.graphql`** — Add L/I fields to the `riskScore` selection
2. **`packages/web/src/pages/appetites/useLabelledFields.tsx`** — Pass L/I to formatters
3. **`packages/web/src/pages/appetites/types.ts`** — Add L/I fields to `AppetiteTableFields`
4. **`packages/web/src/pages/appetites/config.tsx`** — Use L/I lookup instead of `getByLabel`

### Product question
**Appetite thresholds** (Lower/Upper) use the `risk_appetite` taxonomy, not `risk_controlled`/`risk_uncontrolled`. Should the appetite rating scale also come from scoring settings, or remain as a separate taxonomy?

### Depends on: Iteration 2

---

## Iteration 14: Latest Risk Ratings Preview

### What this is
The small preview card on the risk detail page showing the latest inherent and residual rating badges.

### What the user sees
A card with the most recent inherent and residual ratings, each showing a colored badge and date.

### Current behavior
Calls `useRiskScore(riskId)` (returns full `RiskScore` with L/I) and passes it to `useRiskScoreFormatters`.

### Why it's automatic
This component passes the full `RiskScore` object to the formatters. Once Iteration 2 is done, this inherits the fix with zero code changes.

### Changes: None (inherited from Iteration 2)

---

## Iteration 15: Risk Ratings Over Time Widget

### What this is
A line chart showing how each risk's rating has changed over time.

### What the user sees
Lines tracking each risk's rating value over time, with tooltip labels and point colors from the matrix.

### Current behavior
Chart data points are `{ x: date, y: ratingValue }`. Tooltips and colors use `getByValue(y)`.

### Why it needs data enrichment
The series data doesn't include likelihood/impact — just the rating value. But the source `riskAssessmentResult` has both fields.

### Changes
- **`packages/web/src/pages/dashboards/widgets/over-time-widgets/risk-ratings/RiskRatingsOverTime.tsx`** — Add L/I to series data points. Update tooltip/color formatters to use L/I lookup.

### Depends on: Iteration 0

---

## Iteration 16: Universal Dashboard Widgets (Pie/Bar Charts)

### What this is
The configurable dashboard widgets that can group risks by controlled/uncontrolled rating.

### What the user sees
Pie charts or bar charts showing the distribution of risks across rating categories.

### Current behavior
The `categoryOverrideFunction` in the risk data source calls `riskFormatters({ residualRating: ... }).getResidualOption()` to get category colors. Only passes the rating value.

### Why it has L/I
`category.data[0]` is `RiskRegisterFields` which has L/I fields.

### Changes
- **`packages/web/src/pages/dashboards/universal-widget/data-sources/risk.ts`** — Update `categoryOverrideFunction` to pass L/I to formatters
- (Enterprise risk data source is out of scope)

### Depends on: Iteration 2

---

## Out of Scope: Enterprise Risk

Enterprise risk (`packages/web/src/pages/enterprise-risk/`) uses composite aggregated scores (mean/worst-case across child risks) via `getByValue` and `getByRange`. These are NOT individual likelihood x impact pairs and cannot be looked up from the scoring settings matrix.

**Files NOT migrated:**
- `packages/web/src/pages/enterprise-risk/useLabelledFields.tsx`
- `packages/web/src/pages/enterprise-risk/config.tsx`
- `packages/web/src/pages/enterprise-risk/dashboard/SelectedRiskAttribute.tsx`

**Product question**: What should enterprise risk display when an org has scoring settings configured? Options:
1. Continue using taxonomy ratings (current behavior)
2. Don't display rating labels for enterprise risk (just numeric scores)
3. New enterprise-specific lookup logic (not L/I based)

---

## Out of Scope: PR 7 (Reporting)

PR 7 from the original plan ("Reporting — sync `risk_rating_definition` from config") is entirely backend. It ensures the `risk_rating_definition` table stays in sync when scoring settings are created/updated. This is independent of all frontend work above.

---

## Dependency Graph

```
Iteration 0 (Core infrastructure)
├── Iteration 1 (useCalculateRiskRating)
│   └── Iteration 11 (Heatmap — grid dimensions + axis labels)
├── Iteration 2 (useRiskScoreFormatters)
│   ├── Iteration 3 (RiskScoreBadge)
│   ├── Iteration 4 (Risk register rating columns)
│   ├── Iteration 9 (Cross-entity assessment results — partial)
│   ├── Iteration 10 (Compliance monitoring results — partial)
│   ├── Iteration 13 (Appetites)
│   ├── Iteration 14 (Latest ratings preview — automatic, no code)
│   └── Iteration 16 (Universal dashboard widgets)
├── Iteration 5 (Assessment form L/I dropdowns)
├── Iteration 6 (Rating history)
├── Iteration 7 (Assessment result tables)
├── Iteration 8 (Assessment exports)
├── Iteration 12 (Dashboard cards)
└── Iteration 15 (Ratings over time widget)
```

Iterations at the same tree level are independent of each other and can be done in any order.

---

## Open Product Questions

1. **Enterprise risk**: What should happen when scoring settings are configured? (See Out of Scope section)
2. **Rating history**: Should historical ratings be resolved against the current matrix configuration, or preserve the label/color from when they were created?
3. **Appetite thresholds**: Do appetite Lower/Upper values need to come from scoring settings, or remain on the separate `risk_appetite` taxonomy?
4. **Ratings over time chart**: Should the chart reflect current matrix labels/colors for historical data points?

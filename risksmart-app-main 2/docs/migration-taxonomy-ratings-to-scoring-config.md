# Migration Plan: Taxonomy Ratings → `risk_assessment_result_config`

> **Purpose:** Replace the i18n-based taxonomy rating system (`risk_controlled` / `risk_uncontrolled` in `ratings.json`) with the database-driven `risk_assessment_result_config` for per-org scoring configuration. This document contains enough context and implementation detail that a new Claude Code session can pick up and execute each PR.

---

## Table of Contents

1. [Progress](#progress)
2. [Background & Motivation](#background--motivation)
3. [Current Architecture](#current-architecture)
4. [Target Architecture](#target-architecture)
5. [PR 1: Schema Enhancement](#pr-1-schema-enhancement--make-aggregation-conditional-on-multiple-impact-categories)
6. [PR 2: Shared Adapter Layer](#pr-2-shared-adapter-layer--config-to-ratingoption-conversion-utilities)
7. [PR 3: Backend Config-Aware Provider](#pr-3-backend--config-aware-rating-category-provider-for-aggregation-calculators)
8. [PR 4: Frontend Config Hook](#pr-4-frontend--config-aware-rating-hook)
9. [PR 4b: Flatten MatrixEntry Data Model](#pr-4b-flatten-matrixentry-data-model)
10. [PR 5 & 6: Frontend Rating Migration](#pr-5--6-frontend-rating-migration)
11. [PR 7: Reporting Sync](#pr-7-reporting--sync-risk_rating_definition-from-config)
12. [Future Cleanup PRs](#future-prs-post-full-migration)
13. [Org Rollout Process](#org-rollout-process)
14. [Critical Files Summary](#critical-files-summary)
15. [Verification Checklist](#verification-checklist)

---

## Progress

| PR | Status | Notes |
|----|--------|-------|
| PR 1: Schema Enhancement | Done | `aggregation` made optional with conditional validation via `superRefine` |
| PR 2: Shared Adapter Layer | Skipped | Adapters kept local to each consumer instead of a shared package. The backend strips `color` while the frontend needs it, so sharing was not viable |
| PR 3: Backend Config-Aware Provider | Done | `ratingCategories.ts` reads from config when available, falls back to i18n. `configAdapter.ts` inlined — matrix mapping now happens directly in `fromConfig()`. Scoring settings support integrated into aggregation calculators |
| PR 4: Frontend Config Hook | Done | Hook named `useScoringSettings` (not `useRiskRatingConfig`). Adapter functions are private within the hook file. Returns `impactCategories` in addition to the planned fields. No consumers yet |
| PR 4b: Flatten MatrixEntry Data Model | Done | Flattened `likelihoodImpact` array to scalar `likelihood`/`impact` fields. Renamed `MatrixEntry` → `MatrixCell`, `MatrixEntrySchema` → `MatrixCellSchema`, removed `MatrixCellData`. Re-grouping bridges added at rating lookup boundaries |
| PR 5 & 6: Frontend Rating Migration | Done | Replaced by granular iteration plan in [scoring-settings-frontend-migration.md](./scoring-settings-frontend-migration.md) (Iterations 0–16). All 16 iterations complete. Final PRs: #5658 (heatmap + dashboard), #5660 (appetites), #5666 (dashboard widgets). |
| PR 7: Reporting Sync | Done | Renamed to "Scoring Settings Support". Backend: added L/I meta columns to `risks.inherentRating`/`residualRating` via `metaPgColumns`, added `sourceMetaPgColumns` type extension for `riskAssessmentResults.rating`. Frontend: `rating` and `metaRating` display type handlers now use `getRatingByLikelihoodAndImpact` matrix lookup when scoring settings exist, with taxonomy fallback. |

---

## Background & Motivation

Today, risk rating categories (e.g. "Low", "Medium", "High", "Critical") are defined in the i18n taxonomy system under keys `risk_controlled` and `risk_uncontrolled` in `packages/i18n/src/locales/default/en/ratings.json`. Each org can override these via taxonomy customisation, but this approach has limitations:

- Orgs cannot change the number of likelihood/impact levels or matrix dimensions
- The rating definitions are coupled to the i18n translation layer rather than stored as structured data
- No support for multiple impact categories per org

The `risk_assessment_result_config` table already exists and stores a JSON config with likelihood ratings, impact ratings, impact categories, and a full matrix. The goal is to make this config the **primary source of truth** for all rating lookups, with the i18n taxonomy as a fallback for orgs that haven't configured their scoring yet.

**Key principle:** The existence of a `risk_assessment_result_config` row for an org is the switch — no feature flags needed.

---

## Current Architecture

### Database Schema

**Table: `risk_assessment_result_config`** (already exists in `packages/drizzle/src/schema.ts`)

| Column | Type | Notes |
|--------|------|-------|
| `Id` | `uuid` | PK |
| `OrgKey` | `text` | |
| `Version` | `int` | Default 1 |
| `Config` | `jsonb` | Parsed via `RiskAssessmentResultConfigSchema` |
| `IsLatest` | `bool` | Unique index on `(OrgKey)` where `IsLatest = true` |
| timestamps, user refs | | Standard audit columns |

### Config JSON Shape (from `packages/rest-api/src/handlers/risk-assessment-result-config/schema.ts`)

```typescript
// Zod schemas → TypeScript types
RiskAssessmentResultConfig = {
  likelihood: {
    ratings: Array<{ title: string; description?: string; value: number; color: string }>
  };
  impact: {
    categories: Array<{ name: string; color: string }>;
    ratings: Array<{ title: string; description?: string; value: number; color: string }>;
    aggregation?: 'average' | 'maximum';  // required when categories.length > 1; categories must be 0 or 2+
  };
  matrix: Array<{
    title: string;
    value: number;
    color: string;
    likelihoodImpact: Array<{ likelihood: number; impact: number }>;
  }>;
}
```

The schema includes `superRefine` validations ensuring:
- Unique values and titles across ratings
- Matrix completeness (all likelihood × impact pairs covered, no duplicates)

### Repository

**`packages/rest-api/src/repositories/risk-assessment-result-config/riskAssessmentResultConfig.repository.ts`**

```typescript
async getLatest(): Promise<RiskAssessmentResultConfig | undefined>
```

Fetches the `Config` JSONB column where `IsLatest = true`, parses through `RiskAssessmentResultConfigSchema`.

### Backend Rating Lookups (i18n-based — what we're replacing)

**`packages/rest-api/src/handlers/aggregations/calculators.ts`**

Two functions fetch rating categories from i18n:

```typescript
// calculateAggregatedScoreFromModel — lines 75-82
const inherentRatingCategories = i18n.t('risk_uncontrolled', {
  ns: 'ratings',
  returnObjects: true,
}) as unknown as RatingCategory[];
const residualRatingCategories = i18n.t('risk_controlled', {
  ns: 'ratings',
  returnObjects: true,
}) as unknown as RatingCategory[];

// calculateNonAggregatedScoreFromModel — lines 170-177
// Identical pattern
```

**`packages/rest-api/src/handlers/aggregations/riskScore.ts`** — line 48:

```typescript
await initI18n(OrgKey, hasuraClient);
```

This loads the org's taxonomy into i18next so the calculators can read from it.

### Backend Types

**`packages/rest-api/src/handlers/aggregations/types.ts`** — line 28-32:

```typescript
export interface RatingCategory {
  label: string;
  value: number;
  range: [number, number];
}
```

Used by `CalculateResidualRatingFn` and `CalculateInherentRatingFn` in `ModelConfig<T>`.

### Frontend Rating Lookups (i18n-based — what we're replacing)

**`packages/web/src/ratings/useCalculateRiskRating.ts`**

```typescript
export const useCalculateRiskRating = (
  controlType: Risk_Assessment_Result_Control_Type_Enum
) => {
  const { options } = useRating(
    controlType === Risk_Assessment_Result_Control_Type_Enum.Controlled
      ? 'risk_controlled'
      : 'risk_uncontrolled'
  );

  return ({ likelihood, impact }: { likelihood: number; impact: number }) => {
    const combinedValue = Math.max(likelihood, 1) * Math.max(impact, 1);
    const rating = options.find((option) => {
      if (hasLikelihoodImpact(option)) {
        return option.likelihoodImpact.find(
          (li) => li.impact === impact && li.likelihood === likelihood
        );
      }
      return hasRange(option) && range(option.range[0], option.range[1]).includes(combinedValue);
    });
    // returns { label, value, color? } or { label: 'Unknown', value: 0 }
  };
};
```

**`packages/web/src/hooks/useRiskScore.tsx`** — `useRiskScoreFormatters()`:

Uses `useRating('risk_controlled')` and `useRating('risk_uncontrolled')` to get `getByValue` lookup functions for residual/inherent ratings.

### Frontend Types

**`packages/components/src/hooks/types.ts`** — `RatingOption`:

```typescript
export type RatingOption<T = number | string> =
  | { label: string; color: string; value: null; range?: readonly [number, number] }
  | BaseRating<T>
  | RatingWithColor<T>
  | RatingWithColorAndLikelihoodImpact<T>  // has likelihoodImpact: {impact,likelihood}[]
  | RatingWithColorAndRange<T>
  | RatingWithRange<T>;
```

An identical definition exists in `packages/web/src/ratings/ratings.ts`.

### Existing Test Builders

- **`packages/api-tests/data/riskAssessmentResultConfig.ts`** — `buildRiskAssessmentResultConfig()` with 5×5 grid (Rare→Almost Certain × Insignificant→Severe), 4 matrix bands (Low, Medium, High, Critical), 3 impact categories
- **`packages/test-data/src/builders/risk-assessment-result-config-audit.ts`** — `buildRiskAssessmentResultConfigAudit()`

### Shared Package Structure

`packages/shared/src/` currently has: `ai/`, `approvals/`, `date/`, `forms/`, `hierarchy/`, `knock/`, `links/`, `organisation/`, `policy/`, `reporting/`, `third-party/`, `utils/`. No `risk-assessment-result-config/` directory yet.

---

## Target Architecture

```
                    ┌─────────────────────────────────┐
                    │  risk_assessment_result_config   │
                    │        (database, per-org)       │
                    └──────────────┬──────────────────┘
                                   │
                    ┌──────────────▼──────────────────┐
                    │   Shared Adapter Layer (PR 2)    │
                    │  configMatrixToRatingOptions()   │
                    │  configToLikelihoodOptions()     │
                    │  configToImpactOptions()         │
                    └──────┬───────────────┬──────────┘
                           │               │
              ┌────────────▼───┐    ┌──────▼──────────────┐
              │   Backend      │    │   Frontend           │
              │   (PR 3)       │    │   (PRs 4-6)          │
              │                │    │                       │
              │ ratingCategory │    │ useRiskRatingConfig() │
              │ Provider.ts    │    │ useCalculateRiskRating│
              │                │    │ useRiskScore          │
              │ Falls back to  │    │ Assessment forms      │
              │ i18n if no     │    │ Heatmap               │
              │ config exists  │    │                       │
              └────────────────┘    └───────────────────────┘

  Config exists? ──Yes──▶ Use config matrix/ratings
       │
       No
       │
       ▼
  Fall back to i18n taxonomy (risk_controlled / risk_uncontrolled)
```

---

## PR 1: Schema Enhancement — Make `aggregation` conditional on multiple impact categories

**Scope:** Isolated schema change. No behavioral changes for existing configs (all have aggregation set).

**Rationale:** `aggregation` only matters with 2+ impact categories. The frontend already infers multi-impact from category count (`isMultiImpactEnabled` in `packages/web/src/pages/risk-scoring/settings/store.ts` is computed from `impactCategories.length > 0`). No need for an explicit boolean flag.

### Changes

**File: `packages/rest-api/src/handlers/risk-assessment-result-config/schema.ts`**

Make `aggregation` optional, remove `.min(1)` from categories, and add `superRefine` to enforce valid category counts and conditional aggregation:

```typescript
// Current ImpactSchema:
const ImpactSchema = z.object({
  categories: z.array(ImpactCategorySchema).min(1),
  ratings: z.array(RatingSchema).min(1),
  aggregation: AggregationEnum,
});

// New ImpactSchema — categories 0 or 2+, aggregation required only for 2+:
const ImpactSchema = z.object({
  categories: z.array(ImpactCategorySchema),  // remove .min(1)
  ratings: z.array(RatingSchema).min(1),
  aggregation: AggregationEnum.optional(),
}).superRefine((data, ctx) => {
  if (data.categories.length === 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must have 0 categories (single impact) or 2+ categories (multi-impact)',
      path: ['categories'],
    });
  }
  if (data.categories.length > 1 && !data.aggregation) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'aggregation is required when multiple impact categories are defined',
      path: ['aggregation'],
    });
  }
});
```

> **Note:** 0 categories = multi-impact off (the UI shows a generic "impact" rating). 2+ categories = multi-impact on. The frontend validation in `packages/web/src/pages/risk-scoring/settings/validation.ts` already enforces `categories.length > 1` via `areImpactCategoriesComplete`.

**File: `packages/rest-api/src/handlers/assessment-results/impactCalculation.ts`**

Guard aggregation logic: when `categories.length === 0` (single-impact mode), skip aggregation and use the impact value directly.

**Seed/test data updates:**

- Update `packages/api-tests/data/riskAssessmentResultConfig.ts` — add a zero-category (single-impact) builder variant that omits `aggregation`
- Update `packages/test-data/src/builders/risk-assessment-result-config-audit.ts` if it constructs impact objects
- Update any test fixtures in `schema.test.ts`, `post.test.ts`, `put.test.ts` that construct config objects

### Testing

**File: `packages/rest-api/src/handlers/risk-assessment-result-config/schema.test.ts`**

Add test cases for the valid/invalid combinations:

1. No categories (0), no aggregation → **valid** (single-impact mode)
2. No categories (0), aggregation present → **valid** (aggregation ignored)
3. Exactly 1 category → **rejected** (must be 0 or 2+)
4. Multiple categories (2+), aggregation present → **valid**
5. Multiple categories (2+), no aggregation → **rejected**

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/rest-api -- src/handlers/risk-assessment-result-config/
```

---

## PR 2: Shared Adapter Layer — Config-to-RatingOption conversion utilities

**Scope:** New shared utilities with no consumers yet. Purely additive, zero risk.

### Changes

**New file: `packages/shared/src/risk-assessment-result-config/adapter.ts`**

```typescript
import type { RiskAssessmentResultConfig } from './types';

/**
 * Represents a rating option compatible with frontend RatingOption type.
 * Uses the RatingWithColorAndLikelihoodImpact shape from packages/components/src/hooks/types.ts
 */
export type AdapterRatingOption = {
  label: string;
  value: number;
  color: string;
  likelihoodImpact: Array<{ likelihood: number; impact: number }>;
};

/**
 * Convert matrix entries to RatingOption[] shape.
 * Maps: title→label, preserves color, value, and likelihoodImpact.
 */
export function configMatrixToRatingOptions(
  matrix: RiskAssessmentResultConfig['matrix']
): AdapterRatingOption[] {
  return matrix.map((entry) => ({
    label: entry.title,
    value: entry.value,
    color: entry.color,
    likelihoodImpact: entry.likelihoodImpact,
  }));
}

/**
 * Convert likelihood ratings to RatingOption[].
 */
export function configToLikelihoodOptions(
  config: RiskAssessmentResultConfig
): Array<{ label: string; value: number; color: string }> {
  return config.likelihood.ratings.map((r) => ({
    label: r.title,
    value: r.value,
    color: r.color,
  }));
}

/**
 * Convert impact ratings to RatingOption[].
 */
export function configToImpactOptions(
  config: RiskAssessmentResultConfig
): Array<{ label: string; value: number; color: string }> {
  return config.impact.ratings.map((r) => ({
    label: r.title,
    value: r.value,
    color: r.color,
  }));
}
```

**New file: `packages/shared/src/risk-assessment-result-config/types.ts`**

```typescript
// Re-export the config type so both frontend and backend can import
// without depending on packages/rest-api directly.
//
// NOTE: This must stay in sync with the Zod schema in:
//   packages/rest-api/src/handlers/risk-assessment-result-config/schema.ts
//
// Approach options:
// 1. Manually mirror the type here (simple, slight duplication)
// 2. Move the Zod schema to packages/shared and import from rest-api (cleaner but bigger change)
//
// For now, use approach 1. Consider approach 2 in a future cleanup PR.

export type RatingDefinition = {
  title: string;
  description?: string;
  value: number;
  color: string;
};

export type ImpactCategory = {
  name: string;
  color: string;
};

export type MatrixEntry = {
  title: string;
  value: number;
  color: string;
  likelihoodImpact: Array<{ likelihood: number; impact: number }>;
};

export type RiskAssessmentResultConfig = {
  likelihood: {
    ratings: RatingDefinition[];
  };
  impact: {
    categories: ImpactCategory[];
    ratings: RatingDefinition[];
    aggregation?: 'average' | 'maximum';
  };
  matrix: MatrixEntry[];
};
```

**New file: `packages/shared/src/risk-assessment-result-config/index.ts`**

```typescript
export * from './types';
export * from './adapter';
```

### Testing

**New file: `packages/shared/src/risk-assessment-result-config/adapter.test.ts`**

Test cases:
1. `configMatrixToRatingOptions` — converts matrix entries, verifying `title→label` mapping, color/value preserved, likelihoodImpact intact
2. `configToLikelihoodOptions` — converts likelihood ratings
3. `configToImpactOptions` — converts impact ratings
4. **Equivalence test:** Convert the default seed config (from `packages/api-tests/data/riskAssessmentResultConfig.ts`) and verify the resulting `likelihoodImpact` mappings are equivalent to what's in `ratings.json` for `risk_controlled`/`risk_uncontrolled`

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/shared -- src/risk-assessment-result-config/
```

---

## PR 3: Backend — Config-aware rating category provider for aggregation calculators

**Scope:** Backend aggregation path reads from new config when available, falls back to i18n. Enterprise risk scores untouched.

### Changes

**New file: `packages/rest-api/src/handlers/aggregations/ratingCategoryProvider.ts`**

```typescript
import type { RatingCategory } from './types';
import { RiskAssessmentResultConfigRepository } from '../../repositories/risk-assessment-result-config/riskAssessmentResultConfig.repository';
import { configMatrixToRatingOptions } from '@risksmart-app/shared/risk-assessment-result-config';
import i18n from 'i18next';

interface RatingCategorySet {
  inherentRatingCategories: RatingCategory[];
  residualRatingCategories: RatingCategory[];
  source: 'config' | 'i18n';
}

/**
 * Fetches rating categories for an org.
 * If a risk_assessment_result_config exists, converts the matrix to RatingCategory[].
 * Otherwise falls back to i18n taxonomy (risk_uncontrolled / risk_controlled).
 *
 * When using config, inherent and residual use the SAME categories
 * (the config matrix is not split by control type).
 */
export async function getRatingCategoriesForOrg(
  repository: RiskAssessmentResultConfigRepository
): Promise<RatingCategorySet> {
  const config = await repository.getLatest();

  if (config) {
    const matrixOptions = configMatrixToRatingOptions(config.matrix);
    // Convert AdapterRatingOption[] to RatingCategory[]
    // RatingCategory needs: label, value, range
    // For config-based ratings, we use likelihoodImpact matching, not range-based.
    // We still need to provide a range for backward compatibility with existing
    // calculator code that may fall back to range matching.
    const categories: RatingCategory[] = matrixOptions.map((opt) => ({
      label: opt.label,
      value: opt.value,
      range: [opt.value, opt.value] as [number, number], // exact match only
      likelihoodImpact: opt.likelihoodImpact,
    }));

    return {
      inherentRatingCategories: categories,
      residualRatingCategories: categories,
      source: 'config',
    };
  }

  // Fallback: read from i18n taxonomy (existing behavior)
  const inherentRatingCategories = i18n.t('risk_uncontrolled', {
    ns: 'ratings',
    returnObjects: true,
  }) as unknown as RatingCategory[];

  const residualRatingCategories = i18n.t('risk_controlled', {
    ns: 'ratings',
    returnObjects: true,
  }) as unknown as RatingCategory[];

  return {
    inherentRatingCategories,
    residualRatingCategories,
    source: 'i18n',
  };
}
```

**Update: `packages/rest-api/src/handlers/aggregations/types.ts`**

Add optional `likelihoodImpact` to `RatingCategory` (backward-compatible):

```typescript
export interface RatingCategory {
  label: string;
  value: number;
  range: [number, number];
  likelihoodImpact?: Array<{ likelihood: number; impact: number }>; // NEW
}
```

**Update: `packages/rest-api/src/handlers/aggregations/calculators.ts`**

Both `calculateAggregatedScoreFromModel` (line ~66) and `calculateNonAggregatedScoreFromModel` (line ~161):

- Add a parameter for pre-computed rating categories instead of inline `i18n.t()` calls
- Remove the `i18n.t('risk_uncontrolled'|'risk_controlled', ...)` calls at lines 75-82 and 170-177

```typescript
// BEFORE (lines 75-82):
const inherentRatingCategories = i18n.t('risk_uncontrolled', {
  ns: 'ratings',
  returnObjects: true,
}) as unknown as RatingCategory[];
const residualRatingCategories = i18n.t('risk_controlled', {
  ns: 'ratings',
  returnObjects: true,
}) as unknown as RatingCategory[];

// AFTER — accept as parameter:
export async function calculateAggregatedScoreFromModel(
  // ... existing params ...,
  ratingCategories: {
    inherentRatingCategories: RatingCategory[];
    residualRatingCategories: RatingCategory[];
  }
) {
  const { inherentRatingCategories, residualRatingCategories } = ratingCategories;
  // ... rest of function unchanged ...
}
```

Apply the same pattern to `calculateNonAggregatedScoreFromModel`.

**Update: `packages/rest-api/src/handlers/aggregations/riskScore.ts`**

After `initI18n(OrgKey, hasuraClient)` at line 48:

```typescript
await initI18n(OrgKey, hasuraClient);

// NEW: Fetch config-based rating categories (falls back to i18n if no config)
const ratingCategories = await getRatingCategoriesForOrg(
  new RiskAssessmentResultConfigRepository(/* pass required deps */)
);

// Pass ratingCategories to all downstream calculator/handler calls
```

**NOT changed:** `enterpriseRiskScore.ts` — continues using i18n taxonomy ratings as-is.

### Testing

Update `packages/rest-api/src/handlers/aggregations/calculators.test.ts`:

1. **Config-present path:** Provide mock `RatingCategory[]` with `likelihoodImpact` — verify correct rating selection
2. **Config-absent path (fallback):** Provide mock i18n-style `RatingCategory[]` with `range` — verify same behavior as before
3. **Org without config → behavior unchanged** (regression)

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/rest-api -- src/handlers/aggregations/
```

---

## PR 4: Frontend — Config-aware rating hook

**Scope:** New hook that wraps `useGetLatestRiskAssessmentResultConfig`, with no consumers yet. Zero risk.

### Changes

**New file: `packages/web/src/ratings/useRiskRatingConfig.ts`**

```typescript
import { useGetLatestRiskAssessmentResultConfig } from '../hooks/useGetLatestRiskAssessmentResultConfig'; // or wherever this hook lives
import {
  configMatrixToRatingOptions,
  configToLikelihoodOptions,
  configToImpactOptions,
} from '@risksmart-app/shared/risk-assessment-result-config';
import type { RatingOption } from '@risksmart-app/components/src/hooks/types';

/**
 * Hook that provides risk rating configuration.
 * When a risk_assessment_result_config exists for the org, returns converted options.
 * Otherwise returns empty arrays (consumers should fall back to useRating).
 */
export function useRiskRatingConfig() {
  const { data: config, loading } = useGetLatestRiskAssessmentResultConfig();

  const hasConfig = !!config && !loading;

  const matrixOptions: RatingOption[] = config
    ? configMatrixToRatingOptions(config.matrix)
    : [];

  const likelihoodOptions = config
    ? configToLikelihoodOptions(config)
    : [];

  const impactOptions = config
    ? configToImpactOptions(config)
    : [];

  return {
    config,
    loading,
    matrixOptions,
    likelihoodOptions,
    impactOptions,
    hasConfig,
  };
}
```

> **Implementation note:** Find the exact hook name by searching for existing usage:
> ```bash
> grep -r "useGetLatestRiskAssessmentResultConfig\|useRiskAssessmentResultConfig" packages/web/src/ --include="*.ts" --include="*.tsx"
> ```

### Testing

**New file: `packages/web/src/ratings/useRiskRatingConfig.test.tsx`**

- Mock `useGetLatestRiskAssessmentResultConfig` to return test config
- Verify `matrixOptions`, `likelihoodOptions`, `impactOptions` are correctly converted
- Verify `hasConfig` is `true` when config exists, `false` when undefined/loading

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/ratings/useRiskRatingConfig
```

---

## PR 4b: Flatten MatrixEntry Data Model

**Scope:** Change the `MatrixEntry` type from grouped (one entry with array of likelihood/impact pairs) to flat (one entry per cell with single likelihood/impact values). ~26 files affected, most changes are simplifications.

**Rationale:** After removing cell grouping/sync (done in the UI fixes PR), each `MatrixEntry` always has exactly one `likelihoodImpact` pair. The array wrapper is now redundant and adds unnecessary complexity.

**Type change:**

```tsx
// Before (grouped)
interface MatrixEntry {
  title: string; value: number; color: string;
  likelihoodImpact: { likelihood: number; impact: number }[];
}

// After (flat)
interface MatrixEntry {
  title: string; value: number; color: string;
  likelihood: number; impact: number;
}
```

**Files to change:**

| Area | Files |
|------|-------|
| Type definitions | `packages/atomic-ui/src/patterns/ratings-matrix/types.ts`, `packages/atomic-ui/src/blocks/risk-scoring-settings/types.ts`, `packages/web/src/ratings/ratings.ts` |
| Backend schema | `packages/rest-api/src/handlers/risk-assessment-result-config/schema.ts` — restructure `MatrixEntrySchema` to flat `likelihood`/`impact` fields, remove `LikelihoodImpactPairSchema` |
| Backend PUT validation | `packages/rest-api/src/handlers/risk-assessment-result-config/put.ts` — simplify `validateMatrixEntries` |
| Store | `packages/web/src/pages/risk-scoring/settings/store.ts` — simplify `updateMatrixCell`, `deleteLikelihoodLevel`, `deleteImpactLevel` |
| Utils | `packages/atomic-ui/src/patterns/ratings-matrix/utils.ts` — `buildMatrixGrid` becomes 1-to-1 mapping |
| Hydration | `packages/web/src/pages/risk-scoring/settings/useRiskScoringSettingsStore.ts` |
| Transform | `packages/web/src/pages/risk-scoring/settings/transform.ts` |
| Change detection | `packages/web/src/pages/risk-scoring/settings/change-detection.ts` |
| Validation | `packages/web/src/pages/risk-scoring/settings/validation.ts` |
| Ratings hook | `packages/web/src/ratings/useScoringSettings.ts`, `packages/web/src/ratings/ratings.ts` |
| Stories | `packages/atomic-ui/src/patterns/ratings-matrix/RatingsMatrix.stories.tsx`, `packages/atomic-ui/src/blocks/risk-scoring-settings/RiskScoringSettings.stories.tsx` |
| Backend tests | `packages/rest-api/src/handlers/risk-assessment-result-config/schema.test.ts`, `post.test.ts`, `put.test.ts` |
| Frontend tests | `packages/web/src/pages/risk-scoring/settings/useRiskScoringSettingsStore.test.ts`, `validation.test.ts`, `change-detection.test.ts` |
| API test data | `packages/api-tests/data/riskAssessmentResultConfig.ts` |
| Test data builders | `packages/test-data/src/builders/risk-assessment-result-config-audit.ts` |

**DB migration:** Existing `Config` JSONB must be transformed in-place — expand each `likelihoodImpact` array entry into an individual matrix entry with flat `likelihood`/`impact` fields. Write a SQL migration or Lambda script.

**Verification:**

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/web -- src/pages/risk-scoring/settings/
pnpm exec turbo test:unit --filter=@risksmart-app/rest-api -- src/handlers/risk-assessment-result-config/
pnpm exec turbo lint --filter=@risksmart-app/atomic-ui
pnpm exec turbo lint --filter=@risksmart-app/web
pnpm exec turbo lint --filter=@risksmart-app/rest-api
```

---

## PR 5 & 6: Frontend Rating Migration

> **These PRs have been superseded by a granular iteration plan.** See [scoring-settings-frontend-migration.md](./scoring-settings-frontend-migration.md) for the full breakdown (Iterations 0–15).
>
> Key differences from the original plan:
> - Matrix lookup is always by likelihood + impact, never by value (cells with same value can have different labels/colors)
> - Split into 16 independently shippable iterations instead of 2 large PRs
> - Includes dependency graph and open product questions

---

## PR 7: Reporting — Sync `risk_rating_definition` from config

**Scope:** When config is created/updated, keep `risk_rating_definition` table in sync so reporting SQL joins continue working.

### Changes

**Update: `packages/rest-api/src/handlers/risk-assessment-result-config/post.ts`**

After inserting the config, upsert corresponding entries into `risk_rating_definition`:

```typescript
// After successful config insert:
for (const entry of config.matrix) {
  await upsertRiskRatingDefinition({
    Label: entry.title,
    Value: entry.value,
    Color: entry.color,
    OrgKey: orgKey,
    // ... other required fields
  });
}
```

**Update: `packages/rest-api/src/handlers/risk-assessment-result-config/put.ts`**

Same pattern — after successful config update, sync `risk_rating_definition`.

> **Implementation note:** Investigate the `risk_rating_definition` table schema:
> ```bash
> grep -r "risk_rating_definition" packages/drizzle/src/ --include="*.ts"
> ```

### Testing

1. Create config → verify `risk_rating_definition` rows are populated
2. Update config → verify rows are updated
3. Reporting queries produce correct results for both migrated and non-migrated orgs

```bash
pnpm exec turbo test:unit --filter=@risksmart-app/rest-api -- src/handlers/risk-assessment-result-config/
```

---

## Future PRs (post full migration)

Once all orgs have been migrated via the settings UI and the i18n taxonomy fallback path is confirmed dead:

### Remove legacy rating infrastructure

1. **Remove i18n fallback keys** — delete `risk_controlled` and `risk_uncontrolled` from `ratings.json` and any other taxonomy-based rating definitions
2. **Remove fallback paths** — strip the `if (!config)` branches from `packages/rest-api/src/handlers/aggregations/ratingCategories.ts`, `useCalculateRiskRating.ts`, `useRiskScore.tsx`, and all hooks/calculators that dual-path between config and i18n
3. **Remove `initI18n()` for ratings** — the call in `riskScore.ts` is only needed so the i18n fallback can resolve. If i18n is no longer used for ratings, this can be removed (check whether it's still needed for non-rating translations in the aggregation path)
4. **Simplify `useCalculateRiskRating`** — remove the `useRating` fallback and dual-path logic; the hook should only use config-based matrix options

### Remove orphaned scoring models

The range-based scoring models are superseded by `typedControlEffectivenessAverages` (which uses the config matrix's likelihood/impact pair lookup). The `default` model must be **retained** — it serves customers who don't want aggregation and instead rate each tier's risks individually (`requiresAggregation: false`), with the user-submitted `Rating` flowing straight through.

5. **Remove the `controlEffectivenessAverages` scoring model** (`models/controlEffectivenessAverages.ts`) — this model used `getRatingByRange` (score-range-based lookup) which is incompatible with the config matrix's likelihood/impact pair lookup. Superseded by `typedControlEffectivenessAverages`
6. **Remove the `numberOfControlsWithGaps` scoring model** (`models/numberOfControlsWithGaps.ts`) — also range-based, superseded
7. **Remove `getRatingByRange`** from `packages/i18n/src/ratings.ts` — once the range-based models are gone, only `getRatingByLikelihoodAndImpact` is needed
8. **Simplify the `models/index.ts` registry and `RiskScoringModelEnum`** — reduce to two entries: `default` and `typedControlEffectivenessAverages`. Evaluate whether the enum/registry pattern is still justified or whether a simple boolean (`requiresAggregation`) would suffice
9. **Clean up `aggregation_org` settings** — evaluate whether the per-org `RiskScoringModel` and `Config` fields in `aggregation_org` can be simplified now that only two models remain, and whether `risk_assessment_result_config` subsumes the model-specific `Config` blob

### Refactor data structures to match config natively

With the legacy paths removed, the adapter layer that converts config into legacy `RatingCategory` shapes becomes unnecessary:

10. **Replace `RatingCategory` with a config-native type** — remove the `range: [number, number]` field (only needed for the now-removed range-based models). The type should mirror the config matrix entry directly: `{ label: string; value: number; likelihoodImpact: Array<{ likelihood: number; impact: number }> }`
11. **Remove `configAdapter.ts`** — no conversion needed if the native format flows straight through from config to calculators
12. **Remove `ratingCategoriesProvider.ts`** — or simplify to a direct config fetch with no fallback branch
13. **Collapse `inherentRatingCategories` / `residualRatingCategories` into a single `ratingCategories`** — when sourced from config, these are always identical (the config matrix is not split by control type). Every function signature currently threading both separately can be simplified to one
14. **Remove the dummy `range: [0, 0]`** that `ratingCategoriesProvider.ts` injects to satisfy the legacy type — this is a code smell that disappears with the type refactor

### Reporting cleanup

15. **Consider deprecating `risk_rating_definition`** — if reporting is updated to read from `risk_assessment_result_config` directly, the sync logic in `post.ts`/`put.ts` and the `risk_rating_definition` table itself may become redundant

---

## Org Rollout Process

1. Internal CS team opens the org's risk scoring settings page
2. Configures likelihood levels, impact levels, and matrix (or uses defaults that match current taxonomy)
3. Saves — creates the first `risk_assessment_result_config` version
4. The org immediately starts using the new config (existence of config is the switch, no feature flag)
5. Org admin can then manage their own settings going forward

**Rollback:** Delete the org's `risk_assessment_result_config` row to revert to taxonomy ratings.

**Tooling to consider:**
- A "Copy from current taxonomy" button in settings UI that pre-fills from existing taxonomy ratings
- A comparison view showing old ratings vs new config side by side before saving

---

## Critical Files Summary

| File | PR | Change |
|------|----|--------|
| `packages/rest-api/src/handlers/risk-assessment-result-config/schema.ts` | 1 | Make `aggregation` optional, add conditional validation |
| `packages/rest-api/src/handlers/assessment-results/impactCalculation.ts` | 1 | Guard: skip aggregation when no categories (single-impact mode) |
| `packages/shared/src/risk-assessment-result-config/adapter.ts` | 2 | **New** — conversion utilities |
| `packages/shared/src/risk-assessment-result-config/types.ts` | 2 | **New** — shared types |
| `packages/shared/src/risk-assessment-result-config/index.ts` | 2 | **New** — barrel export |
| `packages/rest-api/src/handlers/aggregations/types.ts` | 3 | Extend `RatingCategory` with `likelihoodImpact` |
| `packages/rest-api/src/handlers/aggregations/ratingCategoryProvider.ts` | 3 | **New** — config-or-fallback provider |
| `packages/rest-api/src/handlers/aggregations/calculators.ts` | 3 | Accept pre-computed rating categories |
| `packages/rest-api/src/handlers/aggregations/riskScore.ts` | 3 | Fetch config, pass categories downstream |
| `packages/web/src/ratings/useRiskRatingConfig.ts` | 4 | **New** — config-aware rating hook |
| See [scoring-settings-frontend-migration.md](./scoring-settings-frontend-migration.md) | 5 & 6 | 16 iterations covering all frontend rating consumers |
| `packages/rest-api/src/handlers/risk-assessment-result-config/post.ts` | 7 | Sync to `risk_rating_definition` |
| `packages/rest-api/src/handlers/risk-assessment-result-config/put.ts` | 7 | Sync to `risk_rating_definition` |

---

## Verification Checklist

### Per-PR

- [ ] Unit tests pass for all modified/new files
- [ ] Org without config → behavior is completely unchanged (regression check)
- [ ] Org with config → new config is used, ratings match expected values
- [ ] Lint passes: `pnpm exec turbo lint --filter=<package>`

### End-to-End (after all PRs merged)

- [ ] Create risk assessment result for org **without** config → taxonomy ratings used
- [ ] Set up `risk_assessment_result_config` via settings UI for that org → config takes effect immediately
- [ ] Verify: risk registers show correct ratings
- [ ] Verify: assessment forms show correct dropdowns and calculate correct ratings
- [ ] Verify: heatmap displays correctly with config-defined grid
- [ ] Verify: aggregation scores are correct
- [ ] Delete config → org reverts to taxonomy ratings
- [ ] Re-create config → org switches back to new system
- [ ] Reporting queries return correct data for both org types

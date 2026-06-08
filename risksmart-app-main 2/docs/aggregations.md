# Aggregations

The RiskSmart platform calculates risk scores from the bottom up. Only the lowest-level risks (Tier 3) and their associated controls require direct scoring. Scores for Tier 2 and Tier 1 risks are calculated automatically.

## Table of Contents

- [Aggregations](#aggregations)
  - [Table of Contents](#table-of-contents)
  - [Inherent Score](#inherent-score)
  - [Residual Score](#residual-score)
    - [Control Weight](#control-weight)
    - [Control Effectiveness](#control-effectiveness)
    - [Control Type](#control-type)
  - [Example Calculation](#example-calculation)
    - [Step 1: Inherent score](#step-1-inherent-score)
    - [Step 2: Control effectiveness by type](#step-2-control-effectiveness-by-type)
    - [Step 3: Weighted effectiveness per dimension](#step-3-weighted-effectiveness-per-dimension)
    - [Step 4: Look up mitigation multipliers](#step-4-look-up-mitigation-multipliers)
    - [Step 5: Calculate residual score](#step-5-calculate-residual-score)
  - [Rating Categories](#rating-categories)
    - [Scoring settings (`risk_assessment_result_config`)](#scoring-settings-risk_assessment_result_config)
    - [i18n taxonomy fallback (legacy)](#i18n-taxonomy-fallback-legacy)
  - [Event-Driven Recalculation](#event-driven-recalculation)
  - [Risk Score Aggregation Across Entities](#risk-score-aggregation-across-entities)
    - [Aggregation Methods](#aggregation-methods)
    - [Entity Weights](#entity-weights)
  - [How to turn on and configure aggregations for an org](#how-to-turn-on-and-configure-aggregations-for-an-org)
    - [Modules (preferred)](#modules-preferred)
    - [Hasura console (obsolete)](#hasura-console-obsolete)
    - [Configuration options](#configuration-options)

## Inherent Score

Inherent ratings can be assigned to Tier 3 risks as usual. If inherent ratings were added to Tier 2 or Tier 1 risks before enabling the aggregation feature, they will not affect the final calculation. However, these ratings remain visible in the platform.

- A Tier 2 score is calculated by averaging the most recent scores of all related Tier 3 risks.
- A Tier 1 score is calculated by averaging its Tier 2 scores.

By default:

- A Tier 3 inherent score is determined by multiplying **impact × likelihood**.
- RiskSmart uses a 5×5 matrix for likelihood and impact. This can be configured to other dimensions (e.g., 3×3, 4×6) and also supports non-linear scales (e.g., Fibonacci).
- Customers can set a default inherent score to apply across _all_ risks, eliminating the need to score each risk individually.

## Residual Score

The residual score is based on the inherent rating, control type, control weight, and control effectiveness.

### Control Weight

- Control weight (**w**) is a positive real number, including 0.
- It can be set in the **Control Details** screen.
- Currently, control weights cannot be customised per risk.
- By default, all controls have a weight of **1**.

### Control Effectiveness

Once all controls are rated, RiskSmart calculates a **weighted average** of the most recent effectiveness results (ranging from 0 to 4, where higher is better).

This weighted average determines the level of mitigation applied to the inherent score, using a step function.

**Default intervals:**

| Control Effectiveness | Mitigation Multiplier |
| --------------------- | --------------------- |
| [0–1)                 | 0.95                  |
| [1–2)                 | 0.75                  |
| [2–3)                 | 0.45                  |
| [3–4)                 | 0.20                  |
| [4–∞)                 | 0.01                  |

These intervals are configurable, including the number of ranges, their boundaries, and the associated multipliers.

### Control Type

The control type determines how mitigation is applied across likelihood and impact.

| Control Type | Likelihood Weight | Impact Weight |
| ------------ | ----------------- | ------------- |
| Preventive   | 1                 | 0             |
| Corrective   | 0                 | 1             |
| Detective    | 0.25              | 0.75          |
| Directive    | 0.25              | 0.25          |

## Example Calculation

### Step 1: Inherent score

The inherent score is taken directly from the latest inherent assessment result.

- Likelihood = 4, Impact = 4
- **Inherent score** = 4 × 4 = **16**

### Step 2: Control effectiveness by type

Controls are grouped by type. For each group, the weighted average of the most recent `OverallEffectiveness` values is calculated.

| Control Type | Avg Effectiveness |
| ------------ | ----------------- |
| Preventive   | 1.5               |
| Detective    | 3.2               |
| Corrective   | 4.3               |

### Step 3: Weighted effectiveness per dimension

Each control type contributes to **likelihood** and **impact** separately, weighted by the control type table above. Control types with a weight of 0 for a dimension are excluded entirely (they don't contribute to the average).

**Impact** — using impact weights from the control type table (Preventive=0, Detective=0.75, Corrective=1):

$$
\frac{(0.75 × 3.2) + (1 × 4.3)}{0.75 + 1} = \frac{6.7}{1.75} = 3.83
$$

Preventive is excluded because its impact weight is 0.

**Likelihood** — using likelihood weights (Preventive=1, Detective=0.25, Corrective=0):

$$
\frac{(1 × 1.5) + (0.25 × 3.2)}{1 + 0.25} = \frac{2.3}{1.25} = 1.84
$$

Corrective is excluded because its likelihood weight is 0.

### Step 4: Look up mitigation multipliers

The weighted effectiveness values are mapped to mitigation multipliers using the step function table:

- Impact effectiveness 3.83 → falls in [3, 4) → **mitigation = 0.20**
- Likelihood effectiveness 1.84 → falls in [1, 2) → **mitigation = 0.75**

### Step 5: Calculate residual score

Each dimension of the inherent score is multiplied by its mitigation, rounded, and clamped to a minimum of 1:

- Residual impact = round(max(4 × 0.20, 1)) = round(max(0.8, 1)) = **1**
- Residual likelihood = round(max(4 × 0.75, 1)) = round(3.0) = **3**
- **Residual score** = 1 × 3 = **3**

## Rating Categories

Rating categories define how computed scores map to human-readable ratings (e.g. "Low", "Medium", "High"). There are two sources, with the first taking priority:

### Scoring settings (`risk_assessment_result_config`)

Orgs that have configured their scoring settings via `/settings/risk-scoring` have a `risk_assessment_result_config` row. The config defines:

- **Likelihood ratings** — the available likelihood levels (e.g. Rare, Unlikely, Possible, Likely, Almost Certain)
- **Impact ratings** — the available impact levels, optionally split across multiple impact categories
- **Matrix** — maps each likelihood/impact pair to a rating category with a label, numeric value, and colour

When a config exists, the aggregation process converts the matrix entries into rating categories and uses `getRatingByLikelihoodAndImpact` to look up ratings by exact likelihood/impact pair. The same categories are used for both inherent and residual ratings.

### i18n taxonomy fallback (legacy)

Orgs without a `risk_assessment_result_config` fall back to the i18n taxonomy system. Rating categories are read from `ratings.json` under the keys `risk_uncontrolled` (inherent) and `risk_controlled` (residual). These categories use score-range-based lookup via `getRatingByRange`, where the product of likelihood x impact is matched against `[min, max]` ranges.

Unlike the config path, the i18n path can have **different** inherent and residual categories.

> **Migration in progress:** All orgs are being migrated to scoring settings. See [migration-taxonomy-ratings-to-scoring-config.md](./migration-taxonomy-ratings-to-scoring-config.md) for the full plan and post-migration cleanup tasks.

## Event-Driven Recalculation

Scores are recalculated in response to data change events from Hasura (via EventBridge). The entry point is `packages/rest-api/src/handlers/aggregations/riskScore.ts`.

| Event table                | Trigger                                                                               |
| -------------------------- | ------------------------------------------------------------------------------------- |
| `risk_assessment_result`   | UPDATE — recalculates the parent risk's score                                         |
| `assessment_result_parent` | INSERT/UPDATE/DELETE — recalculates the linked risk's score                           |
| `risk`                     | INSERT/DELETE/UPDATE — recalculates ancestor scores when parent risk changes          |
| `control_parent`           | INSERT/UPDATE/DELETE — recalculates scores for risks linked to the control            |
| `test_result`              | INSERT/UPDATE/DELETE — recalculates scores for risks linked to the control under test |

For aggregation-based models, a change at tier 3 triggers recalculation upward through tier 2 and tier 1 ancestors. For the default (non-aggregation) model, only the directly affected risk is recalculated.

After all risk score recalculations, enterprise risk scores are also recalculated.

## Risk Score Aggregation Across Entities

In addition to aggregating risks across tiers, RiskSmart also supports aggregating and rolling up risk scores across **entities**. A single risk can be assigned to multiple entities (e.g. business units, legal entities, regions), each of which may have its own inherent and residual score.

Entity-level aggregation is performed independently for **inherent** and **residual** scores, using the same approach for both.

### Aggregation Methods

By default, RiskSmart calculates the following aggregate metrics for each risk across all assigned entities:

1. **Mean (Average)**
2. **Median**
3. **Worst-case (Maximum)**

These values are calculated separately for:

- Inherent score
- Residual score

This allows organisations to view risk exposure from multiple perspectives, including central tendency and downside risk.

### Entity Weights

Each entity can optionally be assigned a **numerical weight**. Entity weights influence only the **mean** calculation and are applied using a standard weighted average.

- Entity weights must be non-negative real numbers.
- If no weights are configured, all entities are treated as having equal weight.
- Median and worst-case calculations are **not** affected by entity weights.

## How to turn on and configure aggregations for an org

There are currently two ways to do this

### Modules (preferred)

Orgs that have been migrated to modules can enable aggregations from within the app.

1. Navigate to `/settings/modules`.
2. Under 'Risks module', toggle on the 'Scoring methodology' feature.
3. From the dropdown select the model you want to use. 9/10 times you will want 'Control type-based effectiveness averages' (see above). If a customer is requesting something else e.g. 'Number of ineffective controls' etc talk to Marcell.
4. Majority of the time you can leave the config empty and just use the default values baked into the model but see below for options.
5. Hit save.

### Hasura console (obsolete)

For orgs that don't have modules enabled.

1. Navigate to the hasura console (make sure you are on the correct tenant).
2. Go to the `aggregation_org` table.
3. Insert a new row:

- _OrgKey_: you can get this from the `auth/organisation` table
- _RiskScoringModel_: 9/10 times you will want 'Control type-based effectiveness averages' (see above). If a customer is requesting something else e.g. 'Number of ineffective controls' etc talk to Marcell.
- _Appetite_: `null`
- _Config_: `{}` or `null`, most of the time but see below for options
- _ModifiedAtTimestamp_: `now()`
- _CreatedAtTimestamp_: `now()`
- _CreatedByUser_: `SYSTEM`
- _ModifiedByUser_: `SYSTEM`

### Configuration options

`controlFilterField`

Must be one of: `Type`, `Id`, `CustomAttributeData`. Determines what field to use to filter out controls that shouldn't be used for aggregations. It can either be the control type, a list of IDs or one of the custom fields. If you select `CustomAttributeData` the `controlFilterCustomAttributeKey` cannot be null.

`controlFilterCustomAttributeKey`

Only used when `controlFilterField` is `CustomAttributeData`. Must be the key of the custom attribute that will be used to filter the controls, e.g.: `1721897202720_multiselect`.

`controlFilterValues`

Only used when `controlFilterField` is not null. It is a list of values that will be used to filter the controls based on the selected attribute e.g.: `["preventive","corrective"]` for `Type`.

`enableWeighting`

Boolean. Whether to enable customers providing a custom weight for each control or not. You must set the `weightFieldName` when `true`.

`weightFieldName`

Only used when `enableWeighting` is `true`. Must be the key of the custom attribute that contains the weight e.g. `1721897202720_text`.

`inherentScoreOverride`

Only allowed when the _RiskScoringModel_ is "number of controls with gaps". Overrides _all_ inherent scores with a static value. Must be a number.

`excludeControlsWithValues`

Only allowed when the _RiskScoringModel_ is "number of controls with gaps". List of numbers. Controls that have a certain `OverallRating` that's included in the list will be excluded from the calculation.

`nonEffectiveValues`

Only allowed when the _RiskScoringModel_ is "number of controls with gaps". List of numbers. Controls that have this `OverallRating` will be considered as ineffective.

`mitigations`

List of Objects. E.g.

```
[
    {
        "lowerBound": 1.0,
        "upperBound": 2.0,
        "mitigationMultiplier": 0.5
    },
    {
        "lowerBound": 2.0,
        "upperBound": 4.0,
        "mitigationMultiplier": 0.2
    },
]
```

Sets the how much reduction should be applied to the inherent score, based on the control effectivness. The `lowerBound` and `upperBound` must cover the whole range of possible values without gaps. `lowerBound` is inclusive, `upperBound` is exclusive.

`roundControlEffectiveness`

Boolean. Whether to `Math.round` the average or not before deciding what mitigation to apply.

`ignoreOverallEffectiveness`

Boolean. If `true` the effectivess will be calculated as a product of the Design and Performance Effectiveness values. This gives end-users the option to massage the numbers a bit.

`likelihoodImpactWeights`

Object. E.g.

```
{
    "Corrective": {
        "likelihoodWeight": 0,
        "impactWeight": 1.0
    },
    "Detective": {
        "likelihoodWeight": 0.25,
        "impactWeight": 0.75
    },
    "Preventive": {
        "likelihoodWeight": 1.0,
        "impactWeight": 0
    },
    "Directive": {
        "likelihoodWeight": 0.25,
        "impactWeight": 0.25
    }
}
```

Adjusts how much mitigation the control should apply based on its type. **Important**: if the customer doesn't use the standard control types (as above), you need tweak these options to match whatever framework they use.

# Data Layer Agent Memory

## Entity-specific notes

### action_parent vs control_parent table differences
- `action_parent` has a `ParentType` column (text, NOT NULL) that stores the parent node's `ObjectType` (e.g., 'risk')
- `control_parent` does NOT have a `ParentType` column
- When inserting into `action_parent`, you must look up the parent's `ObjectType` from the `node` table within the same transaction
- Pattern: `tx.query.node.findFirst({ where: eq(node.Id, parentId), columns: { ObjectType: true } })`
- The `node` table's `ObjectType` is typed as `ParentType` from `@risksmart-app/domain/src/types/consts`

### ActionStatus uses `as const` pattern
- Defined in `packages/domain/src/types/consts/action-status.ts`
- Values: `Closed: 'closed'`, `Open: 'open'`, `Pending: 'pending'`
- `z.nativeEnum()` works with both `as const` objects and TypeScript enums

### Actions do NOT have schedule/scheduleState
- Unlike controls and risks, actions have no schedule-related fields
- Actions have additional fields: `DateDue`, `DateRaised`, `Status`, `Priority`, `ClosedDate`

### issue table quirks
- `Details` is `text().notNull()` -- must default to `''` (empty string), NOT `null`
- `Type` is `text().default(ParentTypes.Issue).notNull().$type<ParentType>()` -- requires `as ParentType` cast when assigning from a Zod `z.string()` field
- `RaisedAtTimestamp` is `timestamp().notNull()` -- must be set explicitly (no default), use `new Date().toISOString()`
- `CreatedByUser` is `text()` (nullable, no `.notNull()`)
- `Meta` is `json().$type<JSONB>()` (nullable)
- `CustomAttributeData` is `jsonb().$type<JSONB>()` (nullable)

### issue_parent has ParentType column (same as action_parent)
- `issue_parent` table has `IssueId`, `ParentId`, `ParentType` (all NOT NULL)
- Same pattern as `action_parent` -- must look up parent's `ObjectType` from `node` table
- Pattern: `tx.query.node.findFirst({ where: { Id: parentId }, columns: { ObjectType: true } })`

### acceptance_parent does NOT have ParentType column
- Unlike `action_parent` and `issue_parent`, `acceptance_parent` has NO `ParentType` column
- Columns are: `Id` (the acceptance UUID), `ParentId`, `OrgKey`, `CreatedByUser`, `ModifiedByUser`
- The acceptance ID column is `Id` (NOT `AcceptanceId` — the FK constraint name is misleading)
- No need to look up parent's ObjectType from the `node` table

### acceptance table defaults
- `Title` is `text().notNull()` — default to `''`
- `Details` is `text().notNull()` — default to `''`
- `Status` is `text().$type<AcceptanceStatus>().notNull()` — default to `AcceptanceStatus.Pending`
- `AcceptanceStatus` uses the `as const` object + type alias pattern (like other domain enums) — use `z.nativeEnum(AcceptanceStatus)`

### issue_assessment table quirks
- `Status` is `text().$type<IssueAssessmentStatus>()` -- use `z.nativeEnum(IssueAssessmentStatus)` in schema, NOT `z.string()`
- `IssueAssessmentStatus` is a real TypeScript `enum` (NOT `as const` pattern), from `@risksmart-app/domain/src/types/consts/issue-assessment-status`
- `Type` is derived from parent issue's Type via `issueAssessmentTypeMapping` -- never passed by client
- Use `Omit<typeof issue_assessment.$inferInsert, 'Type'>` for the values parameter so Type is set in the repository
- Tags go on the PARENT ISSUE (`ParentId = parentIssueId`), departments go on the ASSESSMENT (`ParentId = assessmentId`)
- `issue_parent` records for RegulationsBreachedIds/AssociatedControlIds/PoliciesBreachedIds use `IssueId = parentIssueId` (NOT the assessment ID)
- ParentTypes for issue_parent: Obligation = 'obligation', Control = 'control', Document = 'document'

## Import patterns

### ServiceContext in data-layer
- Exported from `services/data-layer/src/types/service-context.ts`
- Barrel export via `services/data-layer/src/types/index.ts`
- Repository files import as: `import type { ServiceContext } from '../types'`
- Processor files import as: `import type { ServiceContext } from 'src/types'`

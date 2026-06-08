---
name: trpc-component-update
description: Updates React components to use new TRPC hooks instead of GraphQL useQuery. Use after creating TRPC hooks during a migration, when replacing useQuery with custom hooks, or when updating component imports from GraphQL to TRPC.
tools: Read, Edit, Glob, Grep
model: sonnet
---

You are a specialized agent for updating React components to use new TRPC hooks instead of GraphQL useQuery calls in the RiskSmart codebase. Your role is to find all components using a specific GraphQL document and update them to use the new wrapper hook.

## FIRST: Check for Migration Context File

Before starting any work, check if a migration context file exists at `.claude/{QueryName}_migration.md`.

If it exists:
1. Read the file to get all required information
2. Use "Basic Information" section for GraphQL document name
3. Use "Components to Update" section for list of files to update
4. Use "Artifacts Created" section for hook name from previous steps
5. After completing your work, the orchestrator will update the "Artifacts Created" section

If it doesn't exist, proceed with the prerequisites provided in your prompt.

## Prerequisites

This agent requires from previous steps:
- GraphQL document name (e.g., `GetDocumentFilesByDocumentIdDocument`)
- New hook name (e.g., `useGetDocumentFilesByDocumentId`)
- Hook import path (e.g., `@/hooks/queries`)

If prerequisites are missing, report: "BLOCKED: Missing [specific item]"

## Concrete Example

Here is a complete, working migration from the codebase:

**File:** `packages/web/src/pages/policy/update/tabs/files/Tab.tsx`

**FROM:**
```typescript
import { useMutation, useQuery } from '@apollo/client';
import {
  DeleteDocumentFilesDocument,
  GetDocumentFilesByDocumentIdDocument,
} from '@risksmart-app/web-graphql-client/generated/graphql';

const Tab: FC<Props> = ({ parent }) => {
  const documentId = useGetGuidParam('documentId');

  const { data, loading, refetch } = useQuery(
    GetDocumentFilesByDocumentIdDocument,
    {
      fetchPolicy: 'no-cache',
      variables: { documentId },
    }
  );
  // ...
};
```

**TO:**
```typescript
import { useMutation } from '@apollo/client';
import { DeleteDocumentFilesDocument } from '@risksmart-app/web-graphql-client/generated/graphql';

import { useGetDocumentFilesByDocumentId } from '@/hooks/queries';

const Tab: FC<Props> = ({ parent }) => {
  const documentId = useGetGuidParam('documentId');

  const { data, loading, refetch } =
    useGetDocumentFilesByDocumentId(documentId);
  // ...
};
```

**Key changes:**
- Removed `useQuery` from Apollo import (kept `useMutation` since still used)
- Removed `GetDocumentFilesByDocumentIdDocument` from GraphQL import
- Added new hook import from `@/hooks/queries`
- Replaced `useQuery(Document, { variables })` with `useNewHook(params)`

## Process

1. Search for all files importing the GraphQL document
2. For each file, read and analyze the current usage
3. Update imports (remove unused, add new hook)
4. Update hook call with correct parameter pattern
5. Verify no TypeScript errors

## Hook Call Patterns

### Pattern 1: Simple query with single variable
```typescript
// FROM:
const { data } = useQuery(GetXDocument, {
  variables: { id },
});

// TO:
const { data } = useGetX(id);
```

### Pattern 2: Query with skip condition
```typescript
// FROM:
const { data, loading } = useQuery(GetXDocument, {
  fetchPolicy: 'no-cache',
  variables: { id },
  skip: !id,
});

// TO:
const { data, loading } = useGetX(id, !id);
```

### Pattern 3: Query with refetch
```typescript
// FROM:
const { data, loading, refetch } = useQuery(GetXDocument, {
  variables: { id },
});

// TO:
const { data, loading, refetch } = useGetX(id);
```

### Pattern 4: Query using param variable directly (skip with undefined)
```typescript
// FROM:
const { refetch, loading } = useQuery(GetXDocument, {
  variables: { documentId },
  skip: true,
});

// TO:
const { refetch, loading } = useGetX(documentId, true);
```

## Import Update Rules

1. **Remove `useQuery`** from `@apollo/client` ONLY if no other `useQuery` calls remain
2. **Remove GraphQL document** from imports
3. **Keep other imports** from GraphQL (enums, types, other documents)
4. **Add new hook import** from `@/hooks/queries`
5. **Maintain import order**: external packages first, then internal with blank line

## Self-Verification

Before completing, verify:
- [ ] All files importing the GraphQL document found and listed
- [ ] Each file updated with correct import changes
- [ ] `useQuery` import removed only when no longer used in file
- [ ] GraphQL document import removed from all updated files
- [ ] New hook import added to all updated files
- [ ] Hook calls updated with correct parameter pattern
- [ ] Data access patterns unchanged (e.g., `data?.table_name[0].Field`)

## Error Recovery

**If multiple useQuery calls exist in file:**
- Check if ALL calls are being migrated
- Only remove `useQuery` import if no calls remain
- Report partial update if some calls remain

**If TypeScript errors about missing properties:**
- The wrapper hook maintains GraphQL response structure
- Verify data access patterns match: `data?.table_name`

**If import errors:**
- Ensure hook is exported from `@/hooks/queries/index.ts`
- Check hook file exists

**If file has other GraphQL documents:**
- Keep the GraphQL import statement
- Only remove the specific document being migrated

## LAST: Update Migration Context File

**After completing your work, you MUST update the migration context file at `.claude/{QueryName}_migration.md`.**

Use the Edit tool to update the following sections:

### Update "Step Progress" section
Change:
```
- [ ] Components updated
```
To:
```
- [x] Components updated
```

### Update "Artifacts Created" section
Update this field with the list of files you modified:
```
- Files Updated: {comma-separated list of file paths}
```

**Example Edit:**
```
old_string: "- Files Updated:"
new_string: "- Files Updated: packages/web/src/pages/policy/update/tabs/files/Tab.tsx, packages/web/src/components/DocumentPreview.tsx"
```

**This step is REQUIRED. The orchestrator relies on reading the context file to verify your work.**

---
name: fix-trpc-migration-tests
description: Fixes unit tests that fail after a GraphQL to tRPC migration. Updates test wrappers, imports, async patterns, and query assertions. Use when tests break because a component now uses tRPC hooks instead of GraphQL queries.
agument-hint: <test-file-path-or-hook-name>
allowed-tools: Read, Edit, Glob, Grep, Bash
---

## Required Inputs

- **target** - One of the following:
  - A path to a specific failing test file, OR
  - The name of the migrated hook
    (e.g. `useGetDocumentFileById`) so the skill can
    search for affected test files automatically.

## Input Validation

Check that **target** is provided. If it is missing, STOP
and tell the user:

> Please provide either the path to the failing test
> file or the name of the migrated hook.
> Example: `useGetDocumentFileById`

## Steps

### 1. Identify failing test files

If **target** is a file path, use that directly as the
target test file.

If **target** is a hook name, search for test files that
import or reference the hook:

Use Grep to find test files importing the hook:

- Pattern: the hook name (e.g. `useGetDocumentFileById`)
- Path: `packages/web/src`
- Glob: `*.test.tsx`

### 2. Run the failing tests to capture errors

Run only the specific failing test files, never the
full suite:

```bash
cd /Users/lewis/Workspace/RiskSmart/risksmart-app/packages/web && pnpm run test:unit {relative-path-to-test-file}
```

Record which tests fail and what the error messages
say. These errors guide which fixes to apply.

### 3. Read and understand each failing test

Read each failing test file end-to-end. Identify:

- Current `getWrapper` call signature and providers
- Whether `defaultMocks` is already imported/spread
- Whether tests are sync or async
- How assertions are written (`getBy`, `queryBy`,
  `findBy`, `waitFor`)
- Whether the component uses publish buttons or
  approval workflows (these need extra mocks)

### 4. Add the defaultMocks import

If the file does not already import `defaultMocks`,
add it. Reference the export structure in:

`packages/web/src/testing/mock-data/index.ts`

The import should be:

```typescript
import { defaultMocks } from 'src/testing/mock-data';
```

If the component renders publish buttons, approval
workflows, or organisation-specific UI, also check
whether `mockedGetOrganisation` needs an additional
import from:

`src/testing/mock-data/mockedGetOrganisation`

### 5. Update getWrapper calls

Update every `getWrapper` call in the file. Reference
these already-migrated test files for the correct
pattern:

- `packages/web/src/components/document-version-preview/DocumentVersionPreview.test.tsx`
  -- standard component test with `...defaultMocks`
  and extra `mockedGetOrganisation()` for publish
  button tests
- `packages/web/src/components/attest-button/AttestButton.test.tsx`
  -- component test using `findBy` queries and
  `'i18n'` provider
- `packages/web/src/pages/data-import/update/useTabs.test.tsx`
  -- hook test using `renderHook` with `waitFor`

Apply these changes to each `getWrapper` call:

1. Spread `...defaultMocks` at the start of the mocks
   array
2. Add `'trpc'` before `'graphql'` in providers
3. Add `'features'` at the end of providers
4. Keep any existing providers (like `'i18n'`,
   `'permission'`, `'notification'`) in place
5. For tests with publish/approval UI, add an extra
   `mockedGetOrganisation()` after `...defaultMocks`

### 6. Convert sync tests to async

Any test callback that depends on tRPC-fetched data
must become async. Change:

- `it('...', () => {` to `it('...', async () => {`

Then wrap assertions that check rendered output in
`await waitFor(() => ...)` or switch to `findBy`
queries (see next step).

### 7. Update query patterns

Apply these replacements where applicable:

- `screen.getByText(x)` that follows a render with
  tRPC data should become `await screen.findByText(x)`
- `screen.getByRole(...)` similarly becomes
  `await screen.findByRole(...)`
- `await waitFor(() => screen.queryByText(x))`
  followed by a separate `expect` should be collapsed
  into `expect(await screen.findByText(x))`
- Keep `screen.queryByText` for negative assertions
  (checking something is NOT rendered), but ensure
  these come after a positive `findBy` or `waitFor`
  that confirms the component has finished loading

### 8. Re-run the fixed tests

Run only the specific files that were fixed:

```bash
cd /Users/lewis/Workspace/RiskSmart/risksmart-app/packages/web && pnpm run test:unit {relative-path-to-test-file}
```

Do NOT run the full test suite. If any tests still
fail, apply error recovery:

- **"Unable to find element"** -- use `findBy` instead
  of `getBy`, or check that mock data matches what the
  component expects
- **tRPC context errors** -- ensure `'trpc'` is in the
  providers list and `...defaultMocks` is spread
- **Feature flag errors** -- ensure `'features'` is in
  the providers list
- **Timeouts** -- the mock data may not match the tRPC
  hook's expected response structure; check the hook
  file for its return type

Iterate until all tests pass.

## Verification

Before reporting completion, confirm every item:

- [ ] All `getWrapper` calls spread `...defaultMocks`
  at the start of the mocks array
- [ ] All `getWrapper` calls include `'trpc'` in the
  providers list
- [ ] All `getWrapper` calls include `'features'` in
  the providers list
- [ ] Tests that depend on tRPC data are `async`
- [ ] Assertions on rendered tRPC data use
  `await waitFor()` or `findBy` queries
- [ ] Each fixed test file passes when run individually

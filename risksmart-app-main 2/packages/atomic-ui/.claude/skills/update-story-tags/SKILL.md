---
name: update-story-tags
description: Automatically updates Storybook story meta tags (new/updated) based on git changes in the atomic-ui package. Triggered whenever files change in the package.
allowed-tools: Read, Edit, Glob, Grep, Bash
model: haiku
autorun: packages/atomic-ui/src/**/*.stories.tsx
---

You are maintaining the `new` and `updated` status tags on Storybook story meta objects in the `packages/atomic-ui` package.

These tags drive visual badges in the Storybook sidebar so reviewers can quickly see which components have changed.

## When This Runs

This skill runs automatically whenever a `.stories.tsx` file is added or modified in `packages/atomic-ui/src/`.

## Steps

### 1. Identify Changed Stories

Run git commands to classify story files by change type:

```bash
# New (untracked) story files in atomic-ui
git ls-files --others --exclude-standard 'packages/atomic-ui/src/**/*.stories.tsx'

# Modified (tracked) story files in atomic-ui
git diff --name-only HEAD 'packages/atomic-ui/src/**/*.stories.tsx'

# Also check staged files
git diff --name-only --cached 'packages/atomic-ui/src/**/*.stories.tsx'
```

Combine the results:
- **New files**: Files that appear in `git ls-files --others` (untracked) OR files that appear in `git diff` with status `A` (added). Use `git diff --name-status HEAD` and `git diff --name-status --cached` to distinguish added vs modified.
- **Modified files**: Files that appear in `git diff` or `git diff --cached` with status `M` (modified) and are NOT new files.

### 2. Get All Story Files

Use Glob to find every `.stories.tsx` file:

```
packages/atomic-ui/src/**/*.stories.tsx
```

### 3. Update Tags

For each story file, read it and update the `tags` array in the meta object:

#### For NEW story files:
- If the meta has a `tags` array, add `'new'` if not already present, and remove `'updated'` if present
- If the meta has no `tags` property, add `tags: ['new'],` after the `component` or `title` line

#### For MODIFIED story files:
- If the meta has a `tags` array, add `'updated'` if not already present, and remove `'new'` if present
- If the meta has no `tags` property, add `tags: ['updated'],` after the `component` or `title` line

#### For UNCHANGED story files (not in the changeset):
- If the meta has `'new'` in its tags, remove it
- If the meta has `'updated'` in its tags, remove it
- If removing these tags leaves an empty `tags: []` array, remove the entire `tags` line
- Do NOT touch other tags like `'wip'`, `'!autodocs'`, `'autodocs'`, or any domain-specific tags

### 4. Preserve Existing Tags

When modifying the tags array, always preserve:
- `'autodocs'` / `'!autodocs'`
- `'wip'`
- Any other tags that are not `'new'` or `'updated'`

Examples of correct transformations:

| Before | Change Type | After |
|--------|-------------|-------|
| `tags: ['wip']` | modified | `tags: ['wip', 'updated']` |
| `tags: ['autodocs', 'new']` | unchanged | `tags: ['autodocs']` |
| `tags: ['updated']` | unchanged | _(remove entire tags line)_ |
| `tags: ['!autodocs', 'wip']` | new | `tags: ['!autodocs', 'wip', 'new']` |
| _(no tags)_ | new | `tags: ['new'],` |
| `tags: ['new']` | modified | `tags: ['updated']` |
| `tags: ['FCA', 'Principles']` | unchanged | `tags: ['FCA', 'Principles']` |

### 5. Important Notes

- Only modify the meta-level `tags` property (the one inside `const meta = { ... }`), not story-level tags on individual story exports
- Use the `Edit` tool for all file modifications — do not use sed/awk
- If a story file you need to modify is also being created/modified by another skill or the user in this session, your tag change will still apply correctly since you're editing a specific line

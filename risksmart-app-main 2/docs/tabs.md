# Tabs

## Adding a new tab

1. Create a new migration that adds the tab to all parent types that should have the tab. Example:

```pgsql
UPDATE risksmart."tab"
SET "Tabs" = jsonb_set(
        "Tabs"::jsonb,
        '{default}',
        "Tabs"->'default' || '{"id": "new tab id"}',
        true
    )
WHERE "ParentType" IN ('settings');
```

2. Add the new tab ID in the `useTabPreferences` hook.

3. Add the new tab in `useTabs`.

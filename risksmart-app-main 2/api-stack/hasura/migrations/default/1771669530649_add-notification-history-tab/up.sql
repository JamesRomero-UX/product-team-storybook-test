-- Add notification history tab to settings
UPDATE risksmart."tab"
SET "Tabs" = jsonb_set(
    "Tabs"::jsonb,
    '{default}',
    "Tabs"->'default' || '{"id": "notifications"}'::jsonb,
    true
  )
WHERE "ParentType" IN ('settings');

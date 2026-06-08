-- Add notificationHistory tab to indicator tab settings
UPDATE risksmart.tab
SET "Tabs" = jsonb_set(
  "Tabs",
  '{default}',
  ("Tabs"->'default') || '[{"id":"notificationHistory"}]'::jsonb
)
WHERE "ParentType" = 'indicator';

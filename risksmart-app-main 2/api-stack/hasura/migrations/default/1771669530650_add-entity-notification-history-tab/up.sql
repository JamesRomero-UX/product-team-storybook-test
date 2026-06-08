-- Add notification history tab to entity detail pages
UPDATE risksmart."tab"
SET "Tabs" = jsonb_set(
    "Tabs"::jsonb,
    '{default}',
    "Tabs"->'default' || '{"id": "notificationHistory"}'::jsonb,
    true
  )
WHERE "ParentType" IN (
  'risk',
  'action',
  'control',
  'control_group',
  'issue',
  'document',
  'indicator',
  'third_party'
);

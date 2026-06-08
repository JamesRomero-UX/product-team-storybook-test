INSERT INTO risksmart."node_type" ("Value", "Comment")
VALUES ('external_api', 'External API') ON CONFLICT DO NOTHING;

INSERT INTO risksmart.role_access (
    "RoleKey",
    "ObjectType",
    "ContributorType",
    "AccessType"
  )
VALUES (
    'RiskManager',
    'external_api',
    'any',
    'insert'
  ),
  (
    'RiskManager',
    'external_api',
    'any',
    'read'
  ),
  (
    'RiskManager',
    'external_api',
    'any',
    'update'
  ),
  (
    'RiskManager',
    'external_api',
    'any',
    'delete'
  ),
  (
    'TechnicalSupport',
    'external_api',
    'any',
    'insert'
  ),
  (
    'TechnicalSupport',
    'external_api',
    'any',
    'read'
  ),
  (
    'TechnicalSupport',
    'external_api',
    'any',
    'update'
  ),
  (
    'TechnicalSupport',
    'external_api',
    'any',
    'delete'
  ),
  (
    'CustomerSupport',
    'external_api',
    'any',
    'insert'
  ),
  (
    'CustomerSupport',
    'external_api',
    'any',
    'read'
  ),
  (
    'CustomerSupport',
    'external_api',
    'any',
    'update'
  ),
  (
    'CustomerSupport',
    'external_api',
    'any',
    'delete'
  )
  
   ON CONFLICT DO NOTHING;

-- Add external api tab to settings
UPDATE risksmart."tab"
SET "Tabs" = jsonb_set(
    "Tabs"::jsonb,
    '{default}',
    "Tabs"->'default' || '{"id": "externalApi"}',
    true
  )
WHERE "ParentType" IN ('settings');
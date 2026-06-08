DO $$
DECLARE environment text;

DECLARE org_key text;

DECLARE userId text;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

IF environment = 'dev' THEN
SELECT 'org_Qshp7tYsxxAWwhVa' INTO org_key;

SELECT 'auth0|644151efc3a961d2784456d9' INTO userId;

END IF;

IF environment = 'dev-cloud' THEN
SELECT 'org_vi3NiqZteCsnNik9' INTO org_key;

SELECT 'auth0|64415100c3a961d2784456ce' INTO userId;

END IF;

IF environment = 'dev-cloud'
OR environment = 'dev' THEN
INSERT INTO risksmart.department (
    "ParentId",
    "DepartmentTypeId",
    "OrgKey",
    "ModifiedByUser",
    "CreatedByUser"
  )
VALUES (
    'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
    'a2781d16-4827-4d81-a9ba-9402e0c56f71',
    org_key,
    userId,
    userId
  ),
  (
    'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
    'a2781d16-4827-4d81-a9ba-9402e0c56f72',
    org_key,
    userId,
    userId
  ),
  (
    'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
    'a2781d16-4827-4d81-a9ba-9402e0c56f73',
    org_key,
    userId,
    userId
  ),
  (
    '9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
    'a2781d16-4827-4d81-a9ba-9402e0c56f71',
    org_key,
    userId,
    userId
  ),
  (
    'c938bde6-460c-4b2a-af42-0d0f8c06a011',
    'a2781d16-4827-4d81-a9ba-9402e0c56f72',
    org_key,
    userId,
    userId
  ),
  (
    '9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
    'a2781d16-4827-4d81-a9ba-9402e0c56f73',
    org_key,
    userId,
    userId
  ),
  (
    '9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
    'a2781d16-4827-4d81-a9ba-9402e0c56f73',
    org_key,
    userId,
    userId
  ),
  (
    '9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
    'a2781d16-4827-4d81-a9ba-9402e0c56f73',
    org_key,
    userId,
    userId
  ) ON CONFLICT DO NOTHING;

END IF;

END $$;
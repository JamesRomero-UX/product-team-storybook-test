-- SET check_function_bodies = false;
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
OR environment = 'dev' THEN with temp_data (
  "Id",
  "CreatedByUser",
  "ModifiedByUser",
  "Title",
  "Description",
  "Tier",
  "ParentRiskId",
  "OrgKey",
  "Meta"
) as (
  VALUES (
      'b2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
      userId,
      userId,
      'Project Delays',
      'Risk of project delays due to supply chain issues',
      1,
      NULL,
      org_key,
      '{"severity": "high", "probability": "medium"}'::json
    ),
    (
      '9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
      userId,
      userId,
      'Budget Overruns',
      'Risk of budget overruns due to unexpected expenses',
      1,
      NULL,
      org_key,
      '{"severity": "medium", "probability": "high"}'::json
    ),
    (
      'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
      userId,
      userId,
      'Scope Creep',
      'Risk of scope creep due to changing requirements',
      1,
      NULL,
      org_key,
      '{"severity": "low", "probability": "low"}'::json
    ),
    (
      'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'::uuid,
      userId,
      userId,
      'Security Breach',
      'Risk of a security breach due to outdated software',
      2,
      'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
      org_key,
      '{"severity": "high", "probability": "medium"}'::json
    ),
    (
      'c938bde6-460c-4b2a-af42-0d0f8c06a011'::uuid,
      userId,
      userId,
      'Data Loss',
      'Risk of data loss due to hardware failure',
      3,
      'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'::uuid,
      org_key,
      '{"severity": "medium", "probability": "high"}'::json
    )
)
INSERT INTO risksmart.risk (
    "Id",
    "CreatedByUser",
    "ModifiedByUser",
    "Title",
    "Description",
    "Tier",
    "ParentRiskId",
    "OrgKey",
    "Meta"
  )
SELECT t."Id",
  t."CreatedByUser",
  t."ModifiedByUser",
  t."Title",
  t."Description",
  t."Tier",
  t."ParentRiskId",
  t."OrgKey",
  t."Meta"
FROM temp_data t
  left JOIN risksmart.risk r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.owner (
    "ParentId",
    "UserId",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser"
  )
values (
    'b2781d16-4827-4d81-a9ba-9402e0c56f7f',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    '9f33de3f-3f3c-485e-a8d7-af16d1a72e94',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'a1d30192-8100-46b1-a584-6db81b22f935',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'c938bde6-460c-4b2a-af42-0d0f8c06a011',
    userId,
    org_key,
    userId,
    userId
  ) ON CONFLICT DO NOTHING;

END IF;

END $$;
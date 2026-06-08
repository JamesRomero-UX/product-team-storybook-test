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
  "Type",
  "OrgKey",
  "Meta"
) as (
  VALUES (
      'f2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
      userId,
      userId,
      'Control Title A',
      'Control Description A',
      'Preventive',
      org_key,
      '{"severity": "high", "probability": "medium"}'::json
    ),
    (
      'ff33de3f-3f3c-485e-a8d7-af16d1a72e94'::uuid,
      userId,
      userId,
      'Control Title B',
      'Control Description B',
      'Corrective',
      org_key,
      '{"severity": "medium", "probability": "high"}'::json
    ),
    (
      'f1d30192-8100-46b1-a584-6db81b22f935'::uuid,
      userId,
      userId,
      'Control Title C',
      'Control Description C',
      'Directive',
      org_key,
      '{"severity": "low", "probability": "low"}'::json
    ),
    (
      'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'::uuid,
      userId,
      userId,
      'Control Title D',
      'Control Description D',
      'Corrective',
      org_key,
      '{"severity": "high", "probability": "medium"}'::json
    ),
    (
      'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b5'::uuid,
      userId,
      userId,
      'Control Title E',
      'Control Description E',
      'Corrective',
      org_key,
      '{"severity": "high", "probability": "medium"}'::json
    ),
    (
      'f938bde6-460c-4b2a-af42-0d0f8c06a011'::uuid,
      userId,
      userId,
      'Control Title F',
      'Control Description F',
      'Detective',
      org_key,
      '{"severity": "medium", "probability": "high"}'::json
    )
)
INSERT INTO risksmart.control (
    "Id",
    "CreatedByUser",
    "ModifiedByUser",
    "Title",
    "Description",
    "Type",
    "OrgKey",
    "Meta"
  )
SELECT t."Id",
  t."CreatedByUser",
  t."ModifiedByUser",
  t."Title",
  t."Description",
  t."Type",
  t."OrgKey",
  t."Meta"
FROM temp_data t
  left JOIN risksmart.control r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.control_parent (
    "ControlId",
    "ParentId",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser"
  )
VALUES (
    'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
    'a1d30192-8100-46b1-a584-6db81b22f935',
    org_key,
    userId,
    userId
  ),
  (
    'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
    'a1d30192-8100-46b1-a584-6db81b22f935',
    org_key,
    userId,
    userId
  ),
  (
    'f1d30192-8100-46b1-a584-6db81b22f935',
    'a1d30192-8100-46b1-a584-6db81b22f935',
    org_key,
    userId,
    userId
  ),
  (
    'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
    'a1d30192-8100-46b1-a584-6db81b22f935',
    org_key,
    userId,
    userId
  ),
  (
    'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b5',
    'a1d30192-8100-46b1-a584-6db81b22f935',
    org_key,
    userId,
    userId
  ),
  (
    'f938bde6-460c-4b2a-af42-0d0f8c06a011',
    'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
    org_key,
    userId,
    userId
  ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart.owner (
    "ParentId",
    "UserId",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser"
  )
values (
    'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'ff33de3f-3f3c-485e-a8d7-af16d1a72e94',
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
    'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'f1b46f3c-83dc-4a8e-b4f4-4fbd00c481b5',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'f938bde6-460c-4b2a-af42-0d0f8c06a011',
    userId,
    org_key,
    userId,
    userId
  ) ON CONFLICT DO NOTHING;

END IF;

END $$;
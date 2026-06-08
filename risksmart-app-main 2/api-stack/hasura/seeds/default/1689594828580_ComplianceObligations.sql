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

-- if dev-cloud and dev are matched.
IF environment = 'dev-cloud'
OR environment = 'dev' THEN with temp_data (
  "Id",
  "Title",
  "OrgKey",
  "ParentId",
  "Description",
  "Interpretation",
  "Adherence",
  "Type",
  "CreatedByUser",
  "ModifiedByUser",
  "CreatedAtTimestamp"
) as (
  VALUES (
      '68873565-c665-4e4d-b086-763c59da1e68'::uuid,
      'CASS',
      org_key,
      null,
      'Client Assets',
      'Our client asset controls',
      'mandatory',
      'standard',
      userId,
      userId,
      '2023-07-14 13:41:58.03502+00'::timestamp
    ),
    (
      'cb030e81-9941-44e3-af98-4599e85201e0'::uuid,
      'CASS 1',
      org_key,
      '68873565-c665-4e4d-b086-763c59da1e68'::uuid,
      'Applications and general provisions',
      'general applications etc',
      'mandatory',
      'chapter',
      userId,
      userId,
      '2023-07-14 14:41:58.03502+00'::timestamp
    ),
    (
      'bc02463e-ab36-4224-bad9-bda519df42b0'::uuid,
      'CASS 1.2',
      org_key,
      'cb030e81-9941-44e3-af98-4599e85201e0'::uuid,
      'General applications: who? what?',
      'who and what',
      'mandatory',
      'rule',
      userId,
      userId,
      '2023-07-14 14:41:58.03502+00'::timestamp
    ),
    (
      '89571185-0342-4614-9f84-ef775cca29bb'::uuid,
      'PRIN',
      org_key,
      null,
      'Principles for Business',
      'Business Integrity',
      'mandatory',
      'standard',
      userId,
      userId,
      '2023-07-12 16:41:58.03502+00'::timestamp
    )
)
INSERT INTO risksmart.obligation (
    "Id",
    "Title",
    "OrgKey",
    "ParentId",
    "Description",
    "Interpretation",
    "Adherence",
    "Type",
    "CreatedByUser",
    "ModifiedByUser",
    "CreatedAtTimestamp"
  )
SELECT t."Id",
  t."Title",
  t."OrgKey",
  t."ParentId",
  t."Description",
  t."Interpretation",
  t."Adherence",
  t."Type",
  t."CreatedByUser",
  t."ModifiedByUser",
  t."CreatedAtTimestamp"
FROM temp_data t
  left JOIN risksmart.obligation r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.owner (
    "ParentId",
    "UserId",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser"
  )
values (
    '68873565-c665-4e4d-b086-763c59da1e68',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'cb030e81-9941-44e3-af98-4599e85201e0',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    'bc02463e-ab36-4224-bad9-bda519df42b0',
    userId,
    org_key,
    userId,
    userId
  ),
  (
    '89571185-0342-4614-9f84-ef775cca29bb',
    userId,
    org_key,
    userId,
    userId
  ) ON CONFLICT DO NOTHING;

/** impacts **/
with temp_data (
  "Id",
  "ParentObligationId",
  "Description",
  "ImpactRating",
  "OrgKey",
  "CreatedByUser",
  "ModifiedByUser",
  "CreatedAtTimestamp"
) as (
  VALUES (
      'c177afed-38a3-469e-ba10-0b0754d71090'::uuid,
      '68873565-c665-4e4d-b086-763c59da1e68'::uuid,
      'Impact of not adhering to CASS',
      4,
      org_key,
      userId,
      userId,
      '2023-07-15 17:41:58.03502+00'::timestamp
    )
)
INSERT INTO risksmart.obligation_impact (
    "Id",
    "ParentObligationId",
    "Description",
    "ImpactRating",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser",
    "CreatedAtTimestamp"
  )
SELECT t."Id",
  t."ParentObligationId",
  t."Description",
  t."ImpactRating",
  t."OrgKey",
  t."CreatedByUser",
  t."ModifiedByUser",
  t."CreatedAtTimestamp"
FROM temp_data t
  left JOIN risksmart.obligation_impact r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
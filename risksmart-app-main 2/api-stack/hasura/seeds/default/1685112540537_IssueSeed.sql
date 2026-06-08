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
  "Details",
  "ImpactsCustomer",
  "IsExternalIssue",
  "DateOccurred",
  "DateIdentified",
  "CreatedByUser",
  "ModifiedByUser",
  "OrgKey",
  "Meta",
  "RaisedAtTimestamp"
) as (
  VALUES (
      '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
      'Issue 1',
      'Issue Details 1',
      true,
      true,
      '2023-04-24 22:41:58.03502+00'::timestamp,
      '2023-05-14 22:41:58.03502+00'::timestamp,
      userId,
      userId,
      org_key,
      '{
                        "severity": "high",
                        "probability": "medium"
                      }'::json,
      '2023-05-14 22:41:58.03502+00'::timestamp
    ),
    (
      '146eea61-5ddf-4ac6-b6f7-8981afa168a8'::uuid,
      'Issue 2',
      'Issue Details 2',
      true,
      true,
      '2023-04-24 22:41:58.03502+00'::timestamp,
      '2023-05-14 22:41:58.03502+00'::timestamp,
      userId,
      userId,
      org_key,
      '{
                        "severity": "high",
                        "probability": "medium"
                      }'::json,
      '2023-05-14 22:41:58.03502+00'::timestamp
    ),
    (
      '2d1a8512-fa2e-4f8c-9c07-8b89e4d074a4'::uuid,
      'Issue 3',
      'Issue Details 3',
      true,
      true,
      '2023-04-24 22:41:58.03502+00'::timestamp,
      '2023-05-14 22:41:58.03502+00'::timestamp,
      userId,
      userId,
      org_key,
      '{
                        "severity": "high",
                        "probability": "medium"
                      }'::json,
      '2023-05-14 22:41:58.03502+00'::timestamp
    )
)
INSERT INTO risksmart.issue (
    "Id",
    "Title",
    "Details",
    "ImpactsCustomer",
    "IsExternalIssue",
    "DateOccurred",
    "DateIdentified",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta",
    "RaisedAtTimestamp"
  )
SELECT t."Id",
  t."Title",
  t."Details",
  t."ImpactsCustomer",
  t."IsExternalIssue",
  t."DateOccurred",
  t."DateIdentified",
  t."CreatedByUser",
  t."ModifiedByUser",
  t."OrgKey",
  t."Meta",
  t."RaisedAtTimestamp"
FROM temp_data t
  left JOIN risksmart.issue r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
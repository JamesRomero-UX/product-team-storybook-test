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
  "Name",
  "Description",
  "ModifiedByUser",
  "OrgKey"
) as (
  VALUES (
      'b2781d16-4827-4d81-a9ba-9402e0c56f71'::uuid,
      'Tag one',
      'An example tag',
      userId,
      org_key
    ),
    (
      'b2781d16-4827-4d81-a9ba-9402e0c56f72'::uuid,
      'Tag two',
      'Another example tag',
      userId,
      org_key
    ),
    (
      'b2781d16-4827-4d81-a9ba-9402e0c56f73'::uuid,
      'Tag three',
      'Yet another example tag',
      userId,
      org_key
    )
)
INSERT INTO risksmart.tag_type (
    "Id",
    "Name",
    "Description",
    "ModifiedByUser",
    "OrgKey"
  )
SELECT t."Id",
  t."Name",
  t."Description",
  t."ModifiedByUser",
  t."OrgKey"
FROM temp_data t
  left JOIN risksmart.tag_type r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
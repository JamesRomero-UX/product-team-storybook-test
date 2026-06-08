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
  "CreatedByUser",
  "ModifiedByUser",
  "OrgKey"
) as (
  VALUES (
      'a2781d16-4827-4d81-a9ba-9402e0c56f71'::uuid,
      'Dept one',
      'An example Dept ',
      userId,
      userId,
      org_key
    ),
    (
      'a2781d16-4827-4d81-a9ba-9402e0c56f72'::uuid,
      'Dept two',
      'Another example Dept',
      userId,
      userId,
      org_key
    ),
    (
      'a2781d16-4827-4d81-a9ba-9402e0c56f73'::uuid,
      'Dept three',
      'Yet another example Dept',
      userId,
      userId,
      org_key
    )
)
INSERT INTO risksmart.department_type (
    "Id",
    "Name",
    "Description",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey"
  )
SELECT t."Id",
  t."Name",
  t."Description",
  t."CreatedByUser",
  t."ModifiedByUser",
  t."OrgKey"
FROM temp_data t
  left JOIN risksmart.department_type r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
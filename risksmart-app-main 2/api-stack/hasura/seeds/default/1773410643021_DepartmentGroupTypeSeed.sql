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
  "CreatedByUser",
  "ModifiedByUser",
  "OrgKey"
) as (
  VALUES (
      'b3891e27-5938-5e92-b0cb-0513f1d67082'::uuid,
      'Dept group one',
      userId,
      userId,
      org_key
    ),
    (
      'b3891e27-5938-5e92-b0cb-0513f1d67083'::uuid,
      'Dept group two',
      userId,
      userId,
      org_key
    ),
    (
      'b3891e27-5938-5e92-b0cb-0513f1d67084'::uuid,
      'Dept group three',
      userId,
      userId,
      org_key
    )
)
INSERT INTO risksmart.department_type_group (
    "Id",
    "Name",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey"
  )
SELECT t."Id",
  t."Name",
  t."CreatedByUser",
  t."ModifiedByUser",
  t."OrgKey"
FROM temp_data t
  left JOIN risksmart.department_type_group r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;

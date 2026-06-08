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
    "ImpactId",
    "RatedItemId",
    "Rating",
    "TestDate",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "CompletedBy"
) as (
    VALUES (
            '23bd03e9-da11-4370-a2f5-e9b4a955b637'::uuid,
            'aaa8eb87-b197-40bd-8b88-778965b52865'::uuid,
            'b2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            3,
            '2023-05-14 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            org_key,
            userId
        )
)
INSERT INTO risksmart.impact_rating (
        "Id",
        "ImpactId",
        "RatedItemId",
        "Rating",
        "TestDate",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "CompletedBy"
    )
SELECT t."Id",
    t."ImpactId",
    t."RatedItemId",
    t."Rating",
    t."TestDate",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."CompletedBy"
FROM temp_data t
    left JOIN risksmart.impact_rating r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
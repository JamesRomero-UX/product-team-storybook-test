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
    "Name",
    "Rationale",
    "ImpactAppetite",
    "LikelihoodAppetite",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey"
) as (
    VALUES (
            'aaa8eb87-b197-40bd-8b88-778965b52865'::uuid,
            'Financial',
            'Financial rationale',
            3,
            4,
            userId,
            userId,
            org_key
        )
)
INSERT INTO risksmart.impact (
        "Id",
        "Name",
        "Rationale",
        "ImpactAppetite",
        "LikelihoodAppetite",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
SELECT t."Id",
    t."Name",
    t."Rationale",
    t."ImpactAppetite",
    t."LikelihoodAppetite",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey"
FROM temp_data t
    left JOIN risksmart.impact r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
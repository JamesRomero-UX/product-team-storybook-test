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
    "Owner",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            '42bbc0fc-f949-4c40-a2db-86abfdc69d2b'::uuid,
            'Control Group 1',
            userId,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '71c1e1c6-186a-4660-9fb3-1ba1cfa12593'::uuid,
            'Control Group 2',
            userId,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '190b0c12-d127-4e89-b5db-ff57195273a6'::uuid,
            'Control Group 3',
            userId,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.control_group (
        "Id",
        "Title",
        "Owner",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."Title",
    t."Owner",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.control_group r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
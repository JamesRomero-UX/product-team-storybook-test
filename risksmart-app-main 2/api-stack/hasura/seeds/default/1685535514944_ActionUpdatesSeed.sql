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
    "Description",
    "ParentActionId",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            '71231531-f14b-43b2-b899-f734fdc70d01'::uuid,
            'Action Update 1',
            'Action update description 1',
            '92884517-4731-4446-abb8-b0cbed0e9842'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '5fb12cda-cfda-4246-a8f9-3debdfbb103f'::uuid,
            'Action Update 2',
            'Action update description 2',
            '92884517-4731-4446-abb8-b0cbed0e9842'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            'e0b45e68-2522-48c8-bf6d-c46180c2617c'::uuid,
            'Action Update 3',
            'Action update description 3',
            '92884517-4731-4446-abb8-b0cbed0e9842'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            'e8a0a790-209c-490e-9d21-a9045528d766'::uuid,
            'Action Update 4',
            'Action update description 4',
            '92884517-4731-4446-abb8-b0cbed0e9842'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.action_update (
        "Id",
        "Title",
        "Description",
        "ParentActionId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."Title",
    t."Description",
    t."ParentActionId",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.action_update r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
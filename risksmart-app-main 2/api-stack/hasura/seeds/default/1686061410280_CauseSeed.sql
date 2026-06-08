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
    "Significance",
    "ParentIssueId",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            '83343ea9-354a-4a9b-8b8c-6485199bd915'::uuid,
            'Cause Title 1',
            'Cause Description 1',
            3,
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '9edc0424-413b-459e-805e-69e42c4b9883'::uuid,
            'Cause Title 2',
            'Cause Description 2',
            2,
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '2bca04f7-1084-4e7b-bd53-06022037ec06'::uuid,
            'Cause Title 3',
            'Cause Description 3',
            1,
            '146eea61-5ddf-4ac6-b6f7-8981afa168a8'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            'bc979055-e717-453b-b2a9-53ee31cb89a3'::uuid,
            'Cause Title 4',
            'Cause Description 4',
            5,
            '146eea61-5ddf-4ac6-b6f7-8981afa168a8'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.cause (
        "Id",
        "Title",
        "Description",
        "Significance",
        "ParentIssueId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."Title",
    t."Description",
    t."Significance",
    t."ParentIssueId",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.cause r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
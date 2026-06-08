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
    "Criticality",
    "ParentIssueId",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta",
    "CostType",
    "CostValue"
) as (
    VALUES (
            '6ab8b783-a9e2-44bb-9d50-27595eb031d5'::uuid,
            'Consequence Title 1',
            'Consequence Description 1',
            3,
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json,
            'hours',
            210
        ),
        (
            '4277eb4e-560f-4364-82df-aabc814f2c9d'::uuid,
            'Consequence Title 2',
            'Consequence Description 2',
            2,
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json,
            'financial',
            210
        ),
        (
            '7d601b85-4e1d-4d61-a150-ceaf261096ea'::uuid,
            'Consequence Title 3',
            'Consequence Description 3',
            1,
            '146eea61-5ddf-4ac6-b6f7-8981afa168a8'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json,
            'hours',
            210
        ),
        (
            'aec54109-94a1-4105-9ffa-df1765a0c23e'::uuid,
            'Consequence Title 4',
            'Consequence Description 4',
            5,
            '146eea61-5ddf-4ac6-b6f7-8981afa168a8'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json,
            'financial',
            210
        )
)
INSERT INTO risksmart.consequence (
        "Id",
        "Title",
        "Description",
        "Criticality",
        "ParentIssueId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Meta",
        "CostType",
        "CostValue"
    )
SELECT t."Id",
    t."Title",
    t."Description",
    t."Criticality",
    t."ParentIssueId",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."Meta",
    t."CostType",
    t."CostValue"
FROM temp_data t
    left JOIN risksmart.consequence r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;

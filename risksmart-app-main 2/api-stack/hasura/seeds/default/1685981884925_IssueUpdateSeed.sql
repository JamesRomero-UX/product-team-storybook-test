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
    "ParentIssueId",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            'cdc09f4c-b0b0-4849-a78b-b16c6ccc68f0'::uuid,
            'Issue Update 1',
            'Issue update description 1',
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '6bbbd7ea-f761-4245-9847-ab43d9d755e1'::uuid,
            'Issue Update 2',
            'Issue update description 2',
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '955ce31b-9a62-4721-acc2-57e7105db50c'::uuid,
            'Issue Update 3',
            'Issue update description 3',
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            'ca8ddd35-ded7-439c-a7ed-6a7a506dd277'::uuid,
            'Issue Update 4',
            'Issue update description 4',
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.issue_update (
        "Id",
        "Title",
        "Description",
        "ParentIssueId",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."Title",
    t."Description",
    t."ParentIssueId",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.issue_update r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
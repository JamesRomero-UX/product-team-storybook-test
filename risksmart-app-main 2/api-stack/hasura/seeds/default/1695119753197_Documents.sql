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
    "DocumentType",
    "Purpose",
    "ParentDocument",
    "CreatedAtTimestamp",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            '0d3a9abc-dd17-4036-ab52-47d13db75128'::uuid,
            'Anti-Discrimination',
            'policy',
            'Anti-Discrimination details',
            null,
            '2023-05-14 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '651a29fd-019f-44b3-9bdc-bc820a9f1cab'::uuid,
            'HR',
            'framework',
            'HR details',
            '0d3a9abc-dd17-4036-ab52-47d13db75128'::uuid,
            '2023-05-14 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '1fd6d8ed-c8b6-4d31-b07d-14c96e5f163f'::uuid,
            'ISO 27001',
            'standard',
            'ISO 27001 details',
            '651a29fd-019f-44b3-9bdc-bc820a9f1cab'::uuid,
            '2023-05-14 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.document (
        "Id",
        "Title",
        "DocumentType",
        "Purpose",
        "ParentDocument",
        "CreatedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."Title",
    t."DocumentType",
    t."Purpose",
    t."ParentDocument",
    t."CreatedAtTimestamp",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.document r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
values (
        '0d3a9abc-dd17-4036-ab52-47d13db75128',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '651a29fd-019f-44b3-9bdc-bc820a9f1cab',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '1fd6d8ed-c8b6-4d31-b07d-14c96e5f163f',
        userId,
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;
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
    "DateRaised",
    "DateDue",
    "CreatedByUser",
    "ModifiedByUser",
    "Status",
    "OrgKey",
    "Meta",
    "Priority",
    "Description"
) as (
    VALUES (
            '92884517-4731-4446-abb8-b0cbed0e9842'::uuid,
            'Action 1',
            '2023-04-24 22:41:58.03502+00'::timestamp,
            '2023-04-24 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            'open',
            org_key,
            '{"severity": "high", "probability": "medium"}'::json,
            1,
            'Description 1'
        ),
        (
            '12fffadd-8a01-4cb7-ac2b-888d1aa5ee54'::uuid,
            'Action 2',
            '2023-04-25 22:41:58.03502+00'::timestamp,
            '2023-04-25 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            'open',
            org_key,
            '{"severity": "high", "probability": "medium"}'::json,
            2,
            'Description 2'
        ),
        (
            '50f6d4b7-4d5e-4b52-b5fa-e6dd4c4def44'::uuid,
            'Action 3',
            '2023-04-21 22:41:58.03502+00'::timestamp,
            '2023-04-25 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            'closed',
            org_key,
            '{"severity": "high", "probability": "medium"}'::json,
            3,
            'Description 3'
        )
)
INSERT INTO risksmart.action (
        "Id",
        "Title",
        "DateRaised",
        "DateDue",
        "CreatedByUser",
        "ModifiedByUser",
        "Status",
        "OrgKey",
        "Meta",
        "Priority",
        "Description"
    )
SELECT t."Id",
    t."Title",
    t."DateRaised",
    t."DateDue",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."Status",
    t."OrgKey",
    t."Meta",
    t."Priority",
    t."Description"
FROM temp_data t
    left JOIN risksmart.action r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
values (
        '92884517-4731-4446-abb8-b0cbed0e9842',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '12fffadd-8a01-4cb7-ac2b-888d1aa5ee54',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '50f6d4b7-4d5e-4b52-b5fa-e6dd4c4def44',
        userId,
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

INSERT INTO risksmart.action_parent (
        "ParentId",
        "ActionId",
        "ParentType",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey"
    )
VALUES (
        'a1d30192-8100-46b1-a584-6db81b22f935',
        '92884517-4731-4446-abb8-b0cbed0e9842',
        'risk',
        userId,
        userId,
        org_key
    ),
(
        '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90',
        '12fffadd-8a01-4cb7-ac2b-888d1aa5ee54',
        'issue',
        userId,
        userId,
        org_key
    ),
(
        'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
        '50f6d4b7-4d5e-4b52-b5fa-e6dd4c4def44',
        'control',
        userId,
        userId,
        org_key
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;

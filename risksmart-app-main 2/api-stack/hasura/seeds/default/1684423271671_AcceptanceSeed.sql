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
    "DateAcceptedFrom",
    "DateAcceptedTo",
    "CreatedByUser",
    "ModifiedByUser",
    "Details",
    "Status",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            '3f61872d-2a71-44b1-b4ba-717ad6c5018c'::uuid,
            'Acceptance 1',
            '2023-04-24 22:41:58.03502+00'::timestamp,
            '2023-04-25 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            'Acceptance details 1',
            'closed',
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '1bc4783f-4cd0-4d96-ba4a-6a7099a132d7'::uuid,
            'Acceptance 2',
            '2023-05-24 22:41:58.03502+00'::timestamp,
            '2023-05-25 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            'Acceptance details 2',
            'open',
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            'c8a45609-44d1-4051-906a-3616f493d29b'::uuid,
            'Acceptance 3',
            '2023-02-24 22:41:58.03502+00'::timestamp,
            '2023-02-25 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            'Acceptance details 3',
            'closed',
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            'b3977083-5828-4d25-812b-09e772277bff'::uuid,
            'Acceptance 4',
            '2023-03-24 22:41:58.03502+00'::timestamp,
            '2023-03-25 22:41:58.03502+00'::timestamp,
            userId,
            userId,
            'Acceptance details 4',
            'closed',
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.acceptance (
        "Id",
        "Title",
        "DateAcceptedFrom",
        "DateAcceptedTo",
        "CreatedByUser",
        "ModifiedByUser",
        "Details",
        "Status",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."Title",
    t."DateAcceptedFrom",
    t."DateAcceptedTo",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."Details",
    t."Status",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.acceptance r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart."acceptance_parent" (
        "Id",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
VALUES (
        '3f61872d-2a71-44b1-b4ba-717ad6c5018c'::uuid,
        'b2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        '1bc4783f-4cd0-4d96-ba4a-6a7099a132d7'::uuid,
        '9f33de3f-3f3c-485e-a8d7-af16d1a72e94'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        'c8a45609-44d1-4051-906a-3616f493d29b'::uuid,
        'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        'b3977083-5828-4d25-812b-09e772277bff'::uuid,
        'd1b46f3c-83dc-4a8e-b4f4-4fbd00c481b4'::uuid,
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;
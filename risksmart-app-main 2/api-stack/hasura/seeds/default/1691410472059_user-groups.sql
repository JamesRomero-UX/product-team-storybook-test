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
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser"
) as (
    VALUES (
            'e37b905b-6aea-4842-8b28-36fe228ae902'::uuid,
            'Board of directors',
            org_key,
            userId,
            userId
        ),
        (
            'b3d6e665-2860-456c-a499-6764230d5bf1'::uuid,
            'Approval team',
            org_key,
            userId,
            userId
        )
)
INSERT INTO risksmart.user_group (
        "Id",
        "Name",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
SELECT t."Id",
    t."Name",
    t."OrgKey",
    t."CreatedByUser",
    t."ModifiedByUser"
FROM temp_data t
    left JOIN risksmart.user_group r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.user_group_user(
        "UserGroupId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
VALUES (
        'e37b905b-6aea-4842-8b28-36fe228ae902',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        'b3d6e665-2860-456c-a499-6764230d5bf1',
        userId,
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;
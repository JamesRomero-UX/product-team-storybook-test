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
    "Type",
    "Unit",
    "UpperToleranceNum",
    "LowerToleranceNum",
    "TargetValueTxt",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser"
) as (
    VALUES (
            'b8694ef8-2f4c-4b41-9c77-60fb44163736'::uuid,
            'Counting Sheep',
            'counting sheep',
            'number',
            'sheep',
            10,
            1,
            null,
            org_key,
            userId,
            userId
        ),
        (
            'b557bd57-0a17-4981-8559-9809296b1975'::uuid,
            'Employees',
            'current employed people in the business',
            'number',
            'people',
            5000,
            500,
            null,
            org_key,
            userId,
            userId
        ),
        (
            '032f6146-8dd7-4f07-b8fd-06156eeaed62'::uuid,
            'Optimism index',
            'index level',
            'text',
            null,
            null,
            null,
            'glass half full',
            org_key,
            userId,
            userId
        )
)
INSERT INTO risksmart.indicator (
        "Id",
        "Title",
        "Description",
        "Type",
        "Unit",
        "UpperToleranceNum",
        "LowerToleranceNum",
        "TargetValueTxt",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
SELECT t."Id",
    t."Title",
    t."Description",
    t."Type",
    t."Unit",
    t."UpperToleranceNum",
    t."LowerToleranceNum",
    t."TargetValueTxt",
    t."OrgKey",
    t."CreatedByUser",
    t."ModifiedByUser"
FROM temp_data t
    left JOIN risksmart.indicator r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
values (
        'b8694ef8-2f4c-4b41-9c77-60fb44163736',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        'b557bd57-0a17-4981-8559-9809296b1975',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '032f6146-8dd7-4f07-b8fd-06156eeaed62',
        userId,
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

with temp_data (
    "Id",
    "IndicatorId",
    "Description",
    "ResultDate",
    "TargetValueTxt",
    "TargetValueNum",
    "OrgKey",
    "CreatedByUser",
    "ModifiedByUser"
) as (
    VALUES (
            '8f00f17f-95b8-4e58-ab18-d0f2aa756b3d'::uuid,
            '032f6146-8dd7-4f07-b8fd-06156eeaed62'::uuid,
            'some test has taken place',
            '2023-09-12 10:41:58.03502+00'::timestamp,
            'glass half full',
            null::numeric,
            org_key,
            userId,
            userId
        )
)
INSERT INTO risksmart.indicator_result (
        "Id",
        "IndicatorId",
        "Description",
        "ResultDate",
        "TargetValueTxt",
        "TargetValueNum",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
SELECT t."Id",
    t."IndicatorId",
    t."Description",
    t."ResultDate",
    t."TargetValueTxt",
    t."TargetValueNum",
    t."OrgKey",
    t."CreatedByUser",
    t."ModifiedByUser"
FROM temp_data t
    left JOIN risksmart.indicator_result r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.indicator_parent (
        "ParentId",
        "IndicatorId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
VALUES (
        'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
        'b8694ef8-2f4c-4b41-9c77-60fb44163736',
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;
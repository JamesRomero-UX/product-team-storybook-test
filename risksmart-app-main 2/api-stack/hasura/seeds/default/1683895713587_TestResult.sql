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
    "CreatedByUser",
    "ModifiedByUser",
    "Title",
    "Submitter",
    "Description",
    "ParentControlId",
    "TestType",
    "DesignEffectiveness",
    "PerformanceEffectiveness",
    "OverallEffectiveness",
    "TestDate",
    "NextTestDate",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            '2cf1c062-d5d0-4ea4-bde4-5e64c35e1bb2'::uuid,
            userId,
            userId,
            'Test Result A',
            userId,
            'Test result A description',
            'f2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            'businessLine',
            1,
            2,
            2,
            '2023-04-24 22:41:58.03502+00'::timestamp,
            '2023-05-24 10:41:58.03502+00'::timestamp,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '289238a7-a26f-40b9-9994-31c687e785d7'::uuid,
            userId,
            userId,
            'Test Result B',
            userId,
            'Test result B description',
            'f2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            '1stLine',
            0,
            0,
            0,
            '2023-04-24 22:41:58.03502+00'::timestamp,
            '2023-05-24 10:41:58.03502+00'::timestamp,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            'a9b62138-c869-44cc-85e5-0c06851e3522'::uuid,
            userId,
            userId,
            'Test Result C',
            userId,
            'Test result C description',
            'ff33de3f-3f3c-485e-a8d7-af16d1a72e94'::uuid,
            '2ndLine',
            2,
            3,
            3,
            '2023-04-24 22:41:58.03502+00'::timestamp,
            '2023-05-24 10:41:58.03502+00'::timestamp,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '2255de57-e314-4fdb-ab69-e457c757d437'::uuid,
            userId,
            userId,
            'Test Result D',
            userId,
            'Test result D description',
            'ff33de3f-3f3c-485e-a8d7-af16d1a72e94'::uuid,
            '3rdLine',
            4,
            4,
            4,
            '2023-04-24 22:41:58.03502+00'::timestamp,
            '2023-05-24 10:41:58.03502+00'::timestamp,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.test_result (
        "Id",
        "CreatedByUser",
        "ModifiedByUser",
        "Title",
        "Submitter",
        "Description",
        "ParentControlId",
        "TestType",
        "DesignEffectiveness",
        "PerformanceEffectiveness",
        "OverallEffectiveness",
        "TestDate",
        "NextTestDate",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."Title",
    t."Submitter",
    t."Description",
    t."ParentControlId",
    t."TestType",
    t."DesignEffectiveness",
    t."PerformanceEffectiveness",
    t."OverallEffectiveness",
    t."TestDate",
    t."NextTestDate",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.test_result r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

END $$;
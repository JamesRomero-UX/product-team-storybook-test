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
    "LowerAppetite",
    "UpperAppetite",
    "Statement",
    "EffectiveDate",
    "ParentRiskId",
    "OrgKey",
    "AppetiteType"
) as (
    VALUES (
            '982fa46d-d099-435a-81d0-6f9ba57f8462'::uuid,
            userId,
            userId,
            1,
            1,
            'Risk Appetite statement 1',
            '2024-05-01T00:00:00Z'::timestamp,
            'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
            org_key,
            'risk'
        ),
        (
            '1a5e4b69-9661-4559-98be-e599406aeb16'::uuid,
            userId,
            userId,
            3,
            3,
            'Risk Appetite statement 2',
            '2024-05-02T00:00:00Z'::timestamp,
            'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
            org_key,
            'risk'
        ),
        (
            '50cc675c-5d74-4612-b7cb-0cfe40951386'::uuid,
            userId,
            userId,
            2,
            5,
            'Risk Appetite statement 3',
            '2024-05-03T00:00:00Z'::timestamp,
            'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
            org_key,
            'risk'
        ),
        (
            '086529bb-0ac1-4c37-b299-185e917f26de'::uuid,
            userId,
            userId,
            1,
            4,
            'Risk Appetite statement 4',
            '2024-05-04T00:00:00Z'::timestamp,
            'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
            org_key,
            'risk'
        ),
        (
            '774357dd-0733-41a6-a5f1-59f59f96553b'::uuid,
            userId,
            userId,
            1,
            4,
            'Impact Appetite statement 1',
            '2024-05-04T00:00:00Z'::timestamp,
            'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
            org_key,
            'impact'
        ),
        (
            '2667413a-3b10-403a-88ed-01f0d15e07dc'::uuid,
            userId,
            userId,
            1,
            4,
            'Impact Appetite statement 2',
            '2024-05-04T00:00:00Z'::timestamp,
            'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
            org_key,
            'impact'
        ),
        (
            'c2beb072-0a4b-48f4-8997-6b9193cf9dd3'::uuid,
            userId,
            userId,
            1,
            4,
            'Likelihood Appetite statement 2',
            '2024-05-04T00:00:00Z'::timestamp,
            'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
            org_key,
            'likelihood'
        )
)
INSERT INTO risksmart.appetite (
        "Id",
        "CreatedByUser",
        "ModifiedByUser",
        "LowerAppetite",
        "UpperAppetite",
        "Statement",
        "EffectiveDate",
        "OrgKey",
        "AppetiteType"
    )
SELECT t."Id",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."LowerAppetite",
    t."UpperAppetite",
    t."Statement",
    t."EffectiveDate",
    t."OrgKey",
    t."AppetiteType"
FROM temp_data t
    left JOIN risksmart.appetite r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart."appetite_parent" (
        "Id",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
VALUES (
        '982fa46d-d099-435a-81d0-6f9ba57f8462'::uuid,
        'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        '1a5e4b69-9661-4559-98be-e599406aeb16'::uuid,
        'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        '50cc675c-5d74-4612-b7cb-0cfe40951386'::uuid,
        'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        '086529bb-0ac1-4c37-b299-185e917f26de'::uuid,
        'a1d30192-8100-46b1-a584-6db81b22f935'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        '774357dd-0733-41a6-a5f1-59f59f96553b'::uuid,
        'aaa8eb87-b197-40bd-8b88-778965b52865'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        '2667413a-3b10-403a-88ed-01f0d15e07dc'::uuid,
        'aaa8eb87-b197-40bd-8b88-778965b52865'::uuid,
        org_key,
        userId,
        userId
    ),
    (
        'c2beb072-0a4b-48f4-8997-6b9193cf9dd3'::uuid,
        'aaa8eb87-b197-40bd-8b88-778965b52865'::uuid,
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;
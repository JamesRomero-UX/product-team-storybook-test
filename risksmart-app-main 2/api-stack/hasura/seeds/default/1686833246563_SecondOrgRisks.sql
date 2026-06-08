DO $$
DECLARE environment text;

DECLARE org_key text;

DECLARE userId text;

BEGIN
SELECT "ValueString" INTO environment
FROM config.env
WHERE "Name" = 'stage';

IF environment = 'dev' THEN
SELECT 'org_Wry1ylTIzMeSDBkT' INTO org_key;

SELECT 'auth0|644152102c766a09dd585d2e' INTO userId;

END IF;

IF environment = 'dev-cloud' THEN
SELECT 'org_67oHQwP2QEGzt5iL' INTO org_key;

SELECT 'auth0|644151242c766a09dd585d29' INTO userId;

END IF;

IF environment = 'dev-cloud'
OR environment = 'dev' THEN with temp_data (
    "Id",
    "CreatedByUser",
    "ModifiedByUser",
    "Title",
    "Description",
    "Tier",
    "ParentRiskId",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            '52f973f9-3ffe-48c7-b3b8-99d455678ff7'::uuid,
            userId,
            userId,
            'MS Project Delays',
            'Risk of project delays due to supply chain issues',
            1,
            NULL,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '0df5af1b-ea10-4598-b8ab-04e1b37baa46'::uuid,
            userId,
            userId,
            'MS Budget Overruns',
            'Risk of budget overruns due to unexpected expenses',
            1,
            NULL,
            org_key,
            '{"severity": "medium", "probability": "high"}'::json
        ),
        (
            '166ce615-a9b8-4aa0-a870-1323f57afdfd'::uuid,
            userId,
            userId,
            'MS Scope Creep',
            'Risk of scope creep due to changing requirements',
            1,
            NULL,
            org_key,
            '{"severity": "low", "probability": "low"}'
        ),
        (
            '05c95c47-5261-4463-bc05-cea28bafea95'::uuid,
            userId,
            userId,
            'MS Security Breach',
            'Risk of a security breach due to outdated software',
            2,
            '52f973f9-3ffe-48c7-b3b8-99d455678ff7'::uuid,
            org_key,
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            '1c6a29b2-750c-442e-ab9a-c1149a13f8f9'::uuid,
            userId,
            userId,
            'MS Data Loss',
            'Risk of data loss due to hardware failure',
            3,
            '0df5af1b-ea10-4598-b8ab-04e1b37baa46'::uuid,
            org_key,
            '{"severity": "medium", "probability": "high"}'::json
        )
)
INSERT INTO risksmart.risk (
        "Id",
        "CreatedByUser",
        "ModifiedByUser",
        "Title",
        "Description",
        "Tier",
        "ParentRiskId",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."Title",
    t."Description",
    t."Tier",
    t."ParentRiskId",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.risk r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.owner (
        "ParentId",
        "UserId",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
values (
        '52f973f9-3ffe-48c7-b3b8-99d455678ff7',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '0df5af1b-ea10-4598-b8ab-04e1b37baa46',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '166ce615-a9b8-4aa0-a870-1323f57afdfd',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '05c95c47-5261-4463-bc05-cea28bafea95',
        userId,
        org_key,
        userId,
        userId
    ),
    (
        '1c6a29b2-750c-442e-ab9a-c1149a13f8f9',
        userId,
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;
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

IF environment = 'dev' THEN WITH temp_data (
    "Id",
    "Name",
    "Description",
    "ParentId",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser",
    "ModifiedAtTimestamp"
) AS (
    VALUES (
            'ce5db7e8-321b-4f80-8998-9aa207e802f1'::uuid,
            'EMEA',
            'EMEA Region',
            NULL,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            'f37292ca-dd89-4efb-977a-53fd6040e3a7'::uuid,
            'APAC',
            'APAC Region',
            NULL,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            '731fba9b-0f5d-4975-bcd2-110dcf6e3051'::uuid,
            'United Kingdom',
            'United Kingdom',
            'ce5db7e8-321b-4f80-8998-9aa207e802f1'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            'c8e39d7b-be28-41ba-8981-ffa7fa787df2'::uuid,
            'Head Office',
            'Manchester',
            '731fba9b-0f5d-4975-bcd2-110dcf6e3051'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            'c6a6ca23-6f2c-4832-a984-9454d12e7890'::uuid,
            'Sales Office',
            'London',
            '731fba9b-0f5d-4975-bcd2-110dcf6e3051'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            '355246b2-3bff-4387-bcd6-656a8450e8eb'::uuid,
            'Germany',
            'Germany',
            'ce5db7e8-321b-4f80-8998-9aa207e802f1'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            'f435fbb9-63c6-40fc-9f9f-8d9f6ffb50e3'::uuid,
            'Regional Head Office',
            'Berlin',
            '355246b2-3bff-4387-bcd6-656a8450e8eb'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            '471b0f8b-3d70-41d8-845e-44af62dd1be8'::uuid,
            'United States of America',
            'United States of America, not including Canada, Greenland, or Mexico',
            'f37292ca-dd89-4efb-977a-53fd6040e3a7'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        )
)
INSERT INTO risksmart."entity" (
        "Id",
        "Name",
        "Description",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    )
SELECT t."Id",
    t."Name",
    t."Description",
    t."ParentId",
    t."OrgKey",
    t."CreatedByUser",
    t."CreatedAtTimestamp",
    t."ModifiedByUser",
    t."ModifiedAtTimestamp"
FROM temp_data t
    LEFT JOIN risksmart."entity" r ON r."Id" = t."Id"
WHERE r."Id" is null;

END IF;

IF environment = 'dev' THEN WITH temp_risks (
    "Id",
    "Title",
    "Tier",
    "Description",
    "ParentId",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser",
    "ModifiedAtTimestamp"
) AS (
    VALUES (
            'b1a6c853-a649-4755-b868-f2dd0f73fcbe'::uuid,
            'Technology',
            1,
            'Risk of technology failure',
            NULL,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            '8c4ac1ce-4d42-4fc7-ae97-8e89827340ff'::uuid,
            'Database',
            2,
            'Risk of database failure',
            'b1a6c853-a649-4755-b868-f2dd0f73fcbe'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            'f02b1467-1192-43c1-8c95-7fd75a2d301c'::uuid,
            'API',
            2,
            'Risk of API Gateway failure',
            'b1a6c853-a649-4755-b868-f2dd0f73fcbe'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            'a926620f-7de7-419c-87c1-80bd14e322ce'::uuid,
            'SQL Injection',
            3,
            'Risk of an SQL Injection attack',
            '8c4ac1ce-4d42-4fc7-ae97-8e89827340ff'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        ),
        (
            '2ba2a962-b8a8-47ac-882a-4c7824008f9b'::uuid,
            'DDoS Attack',
            3,
            'Risk of a DDoS attack',
            'f02b1467-1192-43c1-8c95-7fd75a2d301c'::uuid,
            org_key,
            userId,
            now(),
            userId,
            now()
        )
)
INSERT INTO risksmart."enterprise_risk" (
        "Id",
        "Title",
        "Tier",
        "Description",
        "ParentId",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp"
    )
SELECT tr."Id",
    tr."Title",
    tr."Tier",
    tr."Description",
    tr."ParentId",
    tr."OrgKey",
    tr."CreatedByUser",
    tr."CreatedAtTimestamp",
    tr."ModifiedByUser",
    tr."ModifiedAtTimestamp"
FROM temp_risks tr
    LEFT JOIN risksmart."enterprise_risk" r ON r."Id" = tr."Id"
WHERE r."Id" is null;

END IF;

END $$;
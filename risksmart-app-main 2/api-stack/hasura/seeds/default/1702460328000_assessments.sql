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
OR environment = 'dev' THEN
/** assessments **/
with temp_data (
    "Id",
    "Title",
    "Summary",
    "TargetCompletionDate",
    "ActualCompletionDate",
    "StartDate",
    "NextTestDate",
    "CompletedByUser",
    "OrgKey",
    "ModifiedByUser",
    "CreatedByUser",
    "CreatedAtTimestamp"
) as (
    VALUES (
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'Business integrity check',
            'Make sure the business is working with core principles in mind',
            '2023-07-18 14:41:58.03502+00'::timestamp,
            '2023-07-15 16:41:58.03502+00'::timestamp,
            '2023-07-14 08:41:58.03502+00'::timestamp,
            '2023-08-14 08:41:58.03502+00'::timestamp,
            userId,
            org_key,
            userId,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp
        )
)
INSERT INTO risksmart.assessment (
        "Id",
        "Title",
        "Summary",
        "TargetCompletionDate",
        "ActualCompletionDate",
        "StartDate",
        "NextTestDate",
        "CompletedByUser",
        "OrgKey",
        "ModifiedByUser",
        "CreatedByUser",
        "CreatedAtTimestamp"
    )
SELECT t."Id",
    t."Title",
    t."Summary",
    t."TargetCompletionDate",
    t."ActualCompletionDate",
    t."StartDate",
    t."NextTestDate",
    t."CompletedByUser",
    t."OrgKey",
    t."ModifiedByUser",
    t."CreatedByUser",
    t."CreatedAtTimestamp"
FROM temp_data t
    left JOIN risksmart.assessment r ON r."Id" = t."Id"
WHERE r."Id" is null;
-- Document assessment result
WITH temp_data (
    "Id",
    "AssessmentId",
    "DocumentId",
    "Rating",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser"
) AS (
    VALUES (
            '73bbbd32-824e-4209-9851-66a126eae39d'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            '0d3a9abc-dd17-4036-ab52-47d13db75128'::uuid,
            3,
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        )
)
INSERT INTO risksmart.document_assessment_result (
        "Id",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser"
    )
SELECT t."Id",
    t."Rating",
    t."OrgKey",
    t."CreatedByUser",
    t."CreatedAtTimestamp",
    t."ModifiedByUser"
FROM temp_data t
    LEFT JOIN risksmart.document_assessment_result r ON r."Id" = t."Id"
WHERE r."Id" is null;
-- Obligation assessment result
WITH temp_data (
    "Id",
    "AssessmentId",
    "ObligationId",
    "Rating",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser"
) AS (
    VALUES (
            '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            '68873565-c665-4e4d-b086-763c59da1e68'::uuid,
            5,
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        )
)
INSERT INTO risksmart.obligation_assessment_result (
        "Id",
        "Rating",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser"
    )
SELECT t."Id",
    t."Rating",
    t."OrgKey",
    t."CreatedByUser",
    t."CreatedAtTimestamp",
    t."ModifiedByUser"
FROM temp_data t
    LEFT JOIN risksmart.obligation_assessment_result r ON r."Id" = t."Id"
WHERE r."Id" is null;
-- Risk assessment result
WITH temp_data (
    "Id",
    "AssessmentId",
    "RiskId",
    "Rating",
    "Impact",
    "Likelihood",
    "ControlType",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser"
) AS (
    VALUES (
            '1dcf43c7-62d8-4aff-93aa-db66c62282a4'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'b2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            1,
            2,
            4,
            'Controlled',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        )
)
INSERT INTO risksmart.risk_assessment_result (
        "Id",
        "Rating",
        "Impact",
        "Likelihood",
        "ControlType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser"
    )
SELECT t."Id",
    t."Rating",
    t."Impact",
    t."Likelihood",
    t."ControlType",
    t."OrgKey",
    t."CreatedByUser",
    t."CreatedAtTimestamp",
    t."ModifiedByUser"
FROM temp_data t
    LEFT JOIN risksmart.risk_assessment_result r ON r."Id" = t."Id"
WHERE r."Id" is null;
-- Parents
WITH temp_data (
    "Id",
    "ParentId",
    "ParentType",
    "ResultType",
    "OrgKey",
    "CreatedByUser",
    "CreatedAtTimestamp",
    "ModifiedByUser"
) AS (
    VALUES (
            '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f'::uuid,
            '68873565-c665-4e4d-b086-763c59da1e68'::uuid,
            'obligation',
            'obligation_assessment_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '73bbbd32-824e-4209-9851-66a126eae39d'::uuid,
            '0d3a9abc-dd17-4036-ab52-47d13db75128'::uuid,
            'document',
            'document_assessment_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '1dcf43c7-62d8-4aff-93aa-db66c62282a4'::uuid,
            'b2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            'risk',
            'risk_assessment_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '54da4ab4-4dbe-40b2-9b1a-5ddc0d9cc39f'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'assessment',
            'obligation_assessment_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '73bbbd32-824e-4209-9851-66a126eae39d'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'assessment',
            'document_assessment_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '1dcf43c7-62d8-4aff-93aa-db66c62282a4'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'assessment',
            'risk_assessment_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        -- control test result
        (
            '2cf1c062-d5d0-4ea4-bde4-5e64c35e1bb2'::uuid,
            'f2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            'control',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '289238a7-a26f-40b9-9994-31c687e785d7'::uuid,
            'f2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            'control',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            'a9b62138-c869-44cc-85e5-0c06851e3522'::uuid,
            'f2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            'control',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '2255de57-e314-4fdb-ab69-e457c757d437'::uuid,
            'f2781d16-4827-4d81-a9ba-9402e0c56f7f'::uuid,
            'control',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        -- test result assessment
        (
            '2cf1c062-d5d0-4ea4-bde4-5e64c35e1bb2'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'assessment',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '289238a7-a26f-40b9-9994-31c687e785d7'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'assessment',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            'a9b62138-c869-44cc-85e5-0c06851e3522'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'assessment',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        ),
        (
            '2255de57-e314-4fdb-ab69-e457c757d437'::uuid,
            '5735b222-82cc-4548-98ab-12d0d8e9feb3'::uuid,
            'assessment',
            'test_result',
            org_key,
            userId,
            '2023-07-15 17:41:58.03502+00'::timestamp,
            userId
        )
)
INSERT INTO risksmart.assessment_result_parent (
        "Id",
        "ParentId",
        "ParentType",
        "ResultType",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser"
    )
SELECT t."Id",
    t."ParentId",
    t."ParentType",
    t."ResultType",
    t."OrgKey",
    t."CreatedByUser",
    t."CreatedAtTimestamp",
    t."ModifiedByUser"
FROM temp_data t
    LEFT JOIN risksmart.assessment_result_parent r ON r."Id" = t."Id"
    AND t."ParentId" = r."ParentId"
WHERE r."Id" is null
    AND r."ParentId" is null;
END IF;
END $$;
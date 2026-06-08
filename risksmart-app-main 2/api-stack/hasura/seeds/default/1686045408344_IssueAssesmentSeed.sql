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
    "ParentIssueId",
    "IssueType",
    "Severity",
    "TargetCloseDate",
    "ActualCloseDate",
    "Status",
    "CertifiedIndividual",
    "RegulatoryBreach",
    "Reportable",
    "Rationale",
    "IssueCausedByThirdParty",
    "ThirdPartyResponsible",
    "IssueCausedBySystemIssue",
    "SystemResponsible",
    "PolicyBreach",
    "PoliciesBreached",
    "PolicyOwner",
    "PolicyOwnerCommentary",
    "CreatedByUser",
    "ModifiedByUser",
    "OrgKey",
    "Meta"
) as (
    VALUES (
            -- Id
            '7e34148d-c579-4799-baed-830c1c82f599'::uuid,
            --ParentIssueId
            '75b0ddea-e6da-41a3-b3b4-f6f0d6fddb90'::uuid,
            -- IssueType
            'material-impact',
            --Severity
            5,
            --TargetCloseDate
            '2023-04-21 22:41:58.03502+00'::timestamp,
            -- ActualCloseDate
            '2023-05-11 22:41:58.03502+00'::timestamp,
            -- status
            'closed',
            --CertifiedIndividual
            userId,
            --RegulatoryBreach
            true,
            --Reportable
            true,
            --Rationale
            true,
            --IssueCausedByThirdParty
            true,
            --ThirdPartyResponsible
            'Third party responsible 2',
            --IssueCausedBySystemIssue
            true,
            --SystemResponsible
            'System responsible 2',
            --PolicyBreach
            true,
            --PoliciesBreached
            'Policies breached',
            -- PolicyOwner
            userId,
            --PolicyOwnerCommentary
            'Policy owner commentary 2',
            --User
            userId,
            userId,
            --OrgKey
            org_key,
            -- Metadata
            '{"severity": "high", "probability": "medium"}'::json
        ),
        (
            -- Id
            'a803ea8d-fa58-4757-b6c8-d5e40855251c'::uuid,
            --ParentIssueId
            '146eea61-5ddf-4ac6-b6f7-8981afa168a8'::uuid,
            -- IssueType
            'near-miss',
            --Severity
            3,
            --TargetCloseDate
            '2023-04-24 22:41:58.03502+00'::timestamp,
            -- ActualCloseDate
            '2023-05-14 22:41:58.03502+00'::timestamp,
            -- status
            'open',
            --CertifiedIndividual
            userId,
            --RegulatoryBreach
            true,
            --Reportable
            true,
            --Rationale
            true,
            --IssueCausedByThirdParty
            true,
            --ThirdPartyResponsible
            'Third party responsible',
            --IssueCausedBySystemIssue
            true,
            --SystemResponsible
            'System responsible',
            --PolicyBreach
            true,
            --PoliciesBreached
            'Policies breached',
            -- PolicyOwner
            userId,
            --PolicyOwnerCommentary
            'Policy owner commentary',
            --User
            userId,
            userId,
            --OrgKey
            org_key,
            -- Metadata
            '{"severity": "high", "probability": "medium"}'::json
        )
)
INSERT INTO risksmart.issue_assessment (
        "Id",
        "ParentIssueId",
        "IssueType",
        "Severity",
        "TargetCloseDate",
        "ActualCloseDate",
        "Status",
        "CertifiedIndividual",
        "RegulatoryBreach",
        "Reportable",
        "Rationale",
        "IssueCausedByThirdParty",
        "ThirdPartyResponsible",
        "IssueCausedBySystemIssue",
        "SystemResponsible",
        "PolicyBreach",
        "PoliciesBreached",
        "PolicyOwner",
        "PolicyOwnerCommentary",
        "CreatedByUser",
        "ModifiedByUser",
        "OrgKey",
        "Meta"
    )
SELECT t."Id",
    t."ParentIssueId",
    t."IssueType",
    t."Severity",
    t."TargetCloseDate",
    t."ActualCloseDate",
    t."Status",
    t."CertifiedIndividual",
    t."RegulatoryBreach",
    t."Reportable",
    t."Rationale",
    t."IssueCausedByThirdParty",
    t."ThirdPartyResponsible",
    t."IssueCausedBySystemIssue",
    t."SystemResponsible",
    t."PolicyBreach",
    t."PoliciesBreached",
    t."PolicyOwner",
    t."PolicyOwnerCommentary",
    t."CreatedByUser",
    t."ModifiedByUser",
    t."OrgKey",
    t."Meta"
FROM temp_data t
    left JOIN risksmart.issue_assessment r ON r."Id" = t."Id"
WHERE r."Id" is null;

INSERT INTO risksmart.issue_parent (
        "IssueId",
        "ParentId",
        "ParentType",
        "OrgKey",
        "CreatedByUser",
        "ModifiedByUser"
    )
VALUES(
        '146eea61-5ddf-4ac6-b6f7-8981afa168a8',
        'f2781d16-4827-4d81-a9ba-9402e0c56f7f',
        'control',
        org_key,
        userId,
        userId
    ) ON CONFLICT DO NOTHING;

END IF;

END $$;

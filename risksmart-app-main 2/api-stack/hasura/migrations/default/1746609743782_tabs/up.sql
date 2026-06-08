CREATE TABLE IF NOT EXISTS risksmart.tab (
    "ParentType" TEXT NOT NULL REFERENCES risksmart.parent_type ("Value") ON DELETE CASCADE,
    "Tabs" JSONB NOT NULL,
    PRIMARY KEY ("ParentType")
);

ALTER TABLE risksmart.tab ENABLE ROW LEVEL SECURITY;

INSERT INTO risksmart.tab ("ParentType", "Tabs")
VALUES (
        'risk',
        '{"default":[{"id":"details"},{"id":"controls"},{"id":"impacts"},{"id":"assessments"},{"id":"appetites"},{"id":"acceptances"},{"id":"actions"},{"id":"indicators"},{"id":"approvals"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'document',
        '{"default":[{"id":"details"},{"id":"versions"},{"id":"assessments"},{"id":"issues"},{"id":"issuesBreachLog"},{"id":"issuesConsumerDuty"},{"id":"issuesCustomerTrust"},{"id":"issuesGDPRBreachLog"},{"id":"issuesPCIBreachLog"},{"id":"issuesRiskEvents"},{"id":"issuesSARLog"},{"id":"actions"},{"id":"approvals"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'obligation',
        '{"default":[{"id":"details"},{"id":"impacts"},{"id":"controls"},{"id":"assessments"},{"id":"issues"},{"id":"issuesBreachLog"},{"id":"issuesConsumerDuty"},{"id":"issuesCustomerTrust"},{"id":"issuesGDPRBreachLog"},{"id":"issuesPCIBreachLog"},{"id":"issuesRiskEvents"},{"id":"issuesSARLog"},{"id":"actions"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'third_party',
        '{"default":[{"id":"details"},{"id":"questionnaires"},{"id":"controls"},{"id":"issues"},{"id":"issuesBreachLog"},{"id":"issuesConsumerDuty"},{"id":"issuesCustomerTrust"},{"id":"issuesGDPRBreachLog"},{"id":"issuesPCIBreachLog"},{"id":"issuesRiskEvents"},{"id":"issuesSARLog"},{"id":"actions"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'issue',
        '{"default":[{"id":"details"},{"id":"updates"},{"id":"actions"},{"id":"causes"},{"id":"consequences"},{"id":"assessments"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'document_file',
        '{"default":[{"id":"details"},{"id":"attestations"}]}'::jsonb
    ),
    (
        'action',
        '{"default":[{"id":"details"},{"id":"updates"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'enterprise_risk',
        '{"default":[{"id":"details"},{"id":"entityRisks"}]}'::jsonb
    ),
    (
        'impact',
        '{"default":[{"id":"details"},{"id":"assessments"}]}'::jsonb
    ),
    (
        'control',
        '{"default":[{"id":"details"},{"id":"testResults"},{"id":"issues"},{"id":"issuesBreachLog"},{"id":"issuesConsumerDuty"},{"id":"issuesCustomerTrust"},{"id":"issuesGDPRBreachLog"},{"id":"issuesPCIBreachLog"},{"id":"issuesRiskEvents"},{"id":"issuesSARLog"},{"id":"actions"},{"id":"indicators"},{"id":"approvals"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'appetite',
        '{"default":[{"id":"details"}]}'::jsonb
    ),
    (
        'acceptance',
        '{"default":[{"id":"details"}]}'::jsonb
    ),
    (
        'assessment',
        '{"default":[{"id":"details"},{"id":"activities"},{"id":"findings"}]}'::jsonb
    ),
    (
        'internal_audit_report',
        '{"default":[{"id":"details"},{"id":"activities"},{"id":"findings"}]}'::jsonb
    ),
    (
        'compliance_monitoring_assessment',
        '{"default":[{"id":"details"},{"id":"activities"},{"id":"findings"}]}'::jsonb
    ),
    (
        'control_group',
        '{"default":[{"id":"details"},{"id":"controls"},{"id":"linkedItems"}]}'::jsonb
    ),
    (
        'internal_audit_entity',
        '{"default":[{"id":"details"},{"id":"reports"},{"id":"issues"},{"id":"issuesBreachLog"},{"id":"issuesConsumerDuty"},{"id":"issuesCustomerTrust"},{"id":"issuesGDPRBreachLog"},{"id":"issuesPCIBreachLog"},{"id":"issuesRiskEvents"},{"id":"issuesSARLog"},{"id":"actions"},{"id":"internalAuditRisks"}]}'::jsonb
    ),
    (
        'settings',
        '{"default":[{"id":"users"},{"id":"userGroups"},{"id":"taxonomy"},{"id":"tags"},{"id":"entities"},{"id":"departments"},{"id":"approvals"},{"id":"authentication"},{"id":"audit"},{"id":"dataImport"},{"id":"dataExport"}]}'::jsonb
    ),
    (
        'questionnaire_template',
        '{"default":[{"id":"details"},{"id":"versions"}]}'::jsonb
    );
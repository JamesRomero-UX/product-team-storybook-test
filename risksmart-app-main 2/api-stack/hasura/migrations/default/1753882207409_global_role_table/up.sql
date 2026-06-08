DELETE
FROM auth.user_role;
ALTER TABLE auth.user_role
    DROP CONSTRAINT "user_role_role_id_fkey";
ALTER TABLE auth.user_role
    RENAME COLUMN "RoleId" TO "RoleKey";
ALTER TABLE auth.user_role_audit
    RENAME COLUMN "RoleId" TO "RoleKey";
    
-- Update audit trigger function for auth.user_role
CREATE OR REPLACE FUNCTION auth.user_role_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN IF (
    TG_OP = 'INSERT'
    OR TG_OP = 'UPDATE'
) THEN nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

INSERT INTO auth.user_role_audit (
        "Id",
        "UserId",
        "RoleKey",
        "OrgKey",
        "CreatedByUser",
        "CreatedAtTimestamp",
        "ModifiedByUser",
        "ModifiedAtTimestamp",
        "Action"
    )
VALUES (
        nr."Id",
        nr."UserId",
        nr."RoleKey",
        nr."OrgKey",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP
    );

RETURN NULL;

END;

$body$ LANGUAGE plpgsql;

DROP TABLE IF EXISTS auth.role;
DROP TABLE IF EXISTS auth.role_audit;

CREATE TABLE IF NOT EXISTS auth.role_type
(
    "RoleKey"           TEXT    NOT NULL,
    "Name"              TEXT    NOT NULL,
    "RiskSmartInternal" BOOLEAN NOT NULL DEFAULT FALSE,
    "TopLevelRoleKey"   TEXT    NOT NULL,
    "InstanceRoleKey"   TEXT,
    "Description"       TEXT,
    PRIMARY KEY ("RoleKey"),
    CONSTRAINT "instance_role_key_check" CHECK (
        "InstanceRoleKey" IN ('Reader', 'Owner')
        )
);

INSERT INTO auth.role_type ("RoleKey", "Name", "RiskSmartInternal", "TopLevelRoleKey", "InstanceRoleKey", "Description")
VALUES ('RiskViewer', 'Risk Viewer', FALSE, 'RiskViewer', 'Reader', 'Allows viewing all risks in the organization.'),
       ('PolicyViewer', 'Policy Viewer', FALSE, 'PolicyViewer', 'Reader',
        'Allows viewing all policies in the organization.'),
       ('ComplianceViewer', 'Compliance Viewer', FALSE, 'ComplianceViewer', 'Reader',
        'Allows viewing all obligations in the organization.'),
       ('ThirdPartyViewer', 'Third Party Viewer', FALSE, 'ThirdPartyViewer', 'Reader',
        'Allows viewing all third parties in the organization.'),
       ('IndicatorViewer', 'Indicator Viewer', FALSE, 'IndicatorViewer', 'Reader',
        'Allows viewing all indicators in the organization.'),
       ('ControlViewer', 'Control Viewer', FALSE, 'ControlViewer', 'Reader',
        'Allows viewing all controls in the organization.'),
       ('IssueViewer', 'Issue Viewer', FALSE, 'IssueViewer', 'Reader',
        'Allows viewing all issues in the organization.'),
       ('ActionViewer', 'Action Viewer', FALSE, 'ActionViewer', 'Reader',
        'Allows viewing all actions in the organization.'),
       ('AssessmentViewer', 'Assessment Viewer', FALSE, 'AssessmentViewer', 'Reader',
        'Allows viewing all assessments in the organization.'),
       ('InternalAuditViewer', 'Internal Audit Viewer', FALSE, 'InternalAuditViewer', 'Reader',
        'Allows viewing all internal audit items in the organization.'),
       ('CustomDataSourceViewer', 'Custom Data Source Viewer', FALSE, 'CustomDataSourceViewer', 'Reader',
        'Allows viewing all custom data sources in the organization.'),
       ('RiskManager', 'Risk Manager', FALSE, 'RiskManager', 'Owner', 'Allows managing all risks in the organization.'),
       ('PolicyManager', 'Policy Manager', FALSE, 'PolicyManager', 'Owner',
        'Allows managing all policies in the organization.'),
       ('ComplianceManager', 'Compliance Manager', FALSE, 'ComplianceManager', 'Owner',
        'Allows managing all obligations in the organization.'),
       ('ThirdPartyManager', 'Third Party Manager', FALSE, 'ThirdPartyManager', 'Owner',
        'Allows managing all third parties in the organization.'),
       ('IndicatorManager', 'Indicator Manager', FALSE, 'IndicatorManager', 'Owner',
        'Allows managing all indicators in the organization.'),
       ('ControlManager', 'Control Manager', FALSE, 'ControlManager', 'Owner',
        'Allows managing all controls in the organization.'),
       ('IssueManager', 'Issue Manager', FALSE, 'IssueManager', 'Owner',
        'Allows managing all issues in the organization.'),
       ('ActionManager', 'Action Manager', FALSE, 'ActionManager', 'Owner',
        'Allows managing all actions in the organization.'),
       ('AssessmentManager', 'Assessment Manager', FALSE, 'AssessmentManager', 'Owner',
        'Allows managing all assessments in the organization.'),
       ('InternalAuditManager', 'Internal Audit Manager', FALSE, 'InternalAuditManager', 'Owner',
        'Allows managing all internal audit items in the organization.'),
       ('CustomDataSourceManager', 'Custom Data Source Manager', FALSE, 'CustomDataSourceManager', 'Owner',
        'Allows managing all custom data sources in the organization.'),
       ('Standard', 'Standard', FALSE, 'Standard', NULL, 'Permissions granted by being an owner or contributor'),
       ('CustomerSuccess', 'Customer Success', TRUE, 'CustomerSuccess', NULL,
        'Permissions for customer success team members'),
       ('SettingsManager', 'Settings Manager', FALSE, 'SettingsManager', NULL,
        'Permissions for managing organization settings'),
       ('Public', 'Public', FALSE, 'Public', NULL, 'Basic public access permissions'),
       ('TechnicalSupport', 'Technical Support', FALSE, 'TechnicalSupport', NULL,
        'Permissions for technical support team members'),
        ('ReadOnly', 'Read Only', FALSE, 'ReadOnly', NULL,
        'Permissions to view all data'),
        ('StandardEnhanced', 'Standard Enhanced', FALSE, 'Standard Enhanced', NULL,
        'Standard with permissions to view all data'),
        ('ThirdPartyRespondent', 'Third Party Respondent', FALSE, 'ThirdPartyRespondent', NULL,
        'Permissions for third party respondents to view and respond to questionnaires');

CREATE TABLE IF NOT EXISTS auth.role_resource_type
(
    "ResourceType" TEXT    NOT NULL,
    "IsTopLevel"   BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY ("ResourceType")
);

INSERT INTO auth.role_resource_type ("ResourceType", "IsTopLevel")
VALUES ('risk', TRUE),
       ('control', TRUE),
       ('control_group', TRUE),
       ('action', TRUE),
       ('policy', TRUE),
       ('compliance', TRUE),
       ('third_party', TRUE),
       ('indicator', TRUE),
       ('issue', TRUE),
       ('obligation', TRUE),
       ('document', TRUE),
       ('assessment', TRUE),
       ('internal_audit_entity', TRUE),
       ('internal_audit_report', TRUE),
       ('custom_data_source', TRUE);

CREATE TABLE IF NOT EXISTS auth.role_type_resource_type
(
    "RoleKey"      TEXT NOT NULL,
    "ResourceType" TEXT NOT NULL,
    PRIMARY KEY ("RoleKey", "ResourceType"),
    FOREIGN KEY ("RoleKey") REFERENCES auth.role_type ("RoleKey") ON DELETE CASCADE,
    FOREIGN KEY ("ResourceType") REFERENCES auth.role_resource_type ("ResourceType") ON DELETE CASCADE
);

INSERT INTO auth.role_type_resource_type ("RoleKey", "ResourceType")
VALUES ('RiskViewer', 'risk'),
       ('PolicyViewer', 'policy'),
       ('ComplianceViewer', 'compliance'),
       ('ThirdPartyViewer', 'third_party'),
       ('IndicatorViewer', 'indicator'),
       ('ControlViewer', 'control'),
       ('ControlViewer', 'control_group'),
       ('IssueViewer', 'issue'),
       ('ActionViewer', 'action'),
       ('AssessmentViewer', 'assessment'),
       ('InternalAuditViewer', 'internal_audit_entity'),
       ('InternalAuditViewer', 'internal_audit_report'),
       ('CustomDataSourceViewer', 'custom_data_source'),
       ('RiskManager', 'risk'),
       ('PolicyManager', 'policy'),
       ('ComplianceManager', 'compliance'),
       ('ThirdPartyManager', 'third_party'),
       ('IndicatorManager', 'indicator'),
       ('ControlManager', 'control'),
       ('ControlManager', 'control_group'),
       ('IssueManager', 'issue'),
       ('ActionManager', 'action'),
       ('AssessmentManager', 'assessment'),
       ('InternalAuditManager', 'internal_audit_entity'),
       ('InternalAuditManager', 'internal_audit_report'),
       ('CustomDataSourceManager', 'custom_data_source');

ALTER TABLE auth.user_role
    ADD CONSTRAINT "user_role_role_key_fkey" FOREIGN KEY ("RoleKey") REFERENCES auth.role_type ("RoleKey") ON DELETE CASCADE;
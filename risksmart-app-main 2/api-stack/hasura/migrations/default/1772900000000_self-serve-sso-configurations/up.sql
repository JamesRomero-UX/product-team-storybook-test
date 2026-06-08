INSERT INTO risksmart."node_type" ("Value", "Comment")
VALUES ('sso_configuration', 'SSO Configuration') ON CONFLICT DO NOTHING;

INSERT INTO risksmart.role_access ("RoleKey",
                                   "ObjectType",
                                   "ContributorType",
                                   "AccessType")
VALUES ('CustomerSupport',
        'sso_configuration',
        'any',
        'insert'),
       ('CustomerSupport',
        'sso_configuration',
        'any',
        'read'),
       ('CustomerSupport',
        'sso_configuration',
        'any',
        'update'),
       ('CustomerSupport',
        'sso_configuration',
        'any',
        'delete'),
       ('TechnicalSupport',
        'sso_configuration',
        'any',
        'insert'),
       ('TechnicalSupport',
        'sso_configuration',
        'any',
        'read'),
       ('TechnicalSupport',
        'sso_configuration',
        'any',
        'update'),
       ('TechnicalSupport',
        'sso_configuration',
        'any',
        'delete') ON CONFLICT DO NOTHING;

-- Add sso-configuration tab to settings (only if not already present)
UPDATE risksmart."tab"
SET "Tabs" = jsonb_set(
  "Tabs"::jsonb,
  '{default}',
  "Tabs"->'default' || '{"id": "sso"}',
  true
             )
WHERE "ParentType" IN ('settings');

--Create sso_configuration tables and triggers
CREATE TABLE risksmart."sso_configuration"
(
  "Id"                      uuid                 DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "OrgKey"                  TEXT        NOT NULL REFERENCES auth."organisation" ("OrgKey") ON DELETE CASCADE,
  "Name"                    TEXT        NOT NULL,
  "Strategy"                TEXT        NOT NULL,
  "ClientId"                TEXT        NOT NULL,
  "ConnectionId"            TEXT        NOT NULL,
  "Domain"                  TEXT        NOT NULL,
  "DomainAliases"           TEXT[]               DEFAULT '{}',
  "IsActive"                BOOLEAN              DEFAULT FALSE,
  "IsRestApiEnabled"        BOOLEAN              DEFAULT FALSE,
  "IsOrganizationConnected" BOOLEAN              DEFAULT FALSE,
  "CreatedAtTimestamp"      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "ModifiedAtTimestamp"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "CreatedByUser"           TEXT        NOT NULL REFERENCES auth."user" ("Id"),
  "ModifiedByUser"          TEXT        NOT NULL REFERENCES auth."user" ("Id")
);

CREATE TABLE risksmart."sso_configuration_audit"
(
  "Id"                      uuid                NOT NULL,
  "OrgKey"                  TEXT                NOT NULL,
  "Name"                    TEXT                NOT NULL,
  "Strategy"                TEXT                NOT NULL,
  "ClientId"                TEXT                NOT NULL,
  "ConnectionId"            TEXT                NOT NULL,
  "Domain"                  TEXT                NOT NULL,
  "DomainAliases"           TEXT[],
  "IsActive"                BOOLEAN,
  "IsRestApiEnabled"        BOOLEAN,
  "IsOrganizationConnected" BOOLEAN,
  "CreatedAtTimestamp"      TIMESTAMPTZ         NOT NULL,
  "ModifiedAtTimestamp"     TIMESTAMPTZ         NOT NULL,
  "CreatedByUser"           TEXT                NOT NULL,
  "ModifiedByUser"          TEXT                NOT NULL,
  "Action"                  risksmart.db_action NOT NULL,
  CONSTRAINT sso_configuration_audit_pkey PRIMARY KEY ("Id", "OrgKey", "ModifiedAtTimestamp")
);

CREATE INDEX IF NOT EXISTS "idx_sso_configuration_orgkey" on risksmart.sso_configuration("OrgKey");

CREATE
OR REPLACE FUNCTION risksmart.sso_configuration_modified() RETURNS trigger AS $body$
DECLARE
nr RECORD;

DECLARE
updated_user TEXT;

DECLARE
update_timestamp timestamp with time zone;

BEGIN IF
(
  TG_OP = 'UPDATE'
  OR TG_OP = 'INSERT'
) THEN nr := NEW;

updated_user
:= NEW."ModifiedByUser";

update_timestamp
:= NEW."ModifiedAtTimestamp";

ELSIF
(TG_OP = 'DELETE') THEN nr := OLD;

updated_user
:= risksmart.get_hasura_user_id();

update_timestamp
:= statement_timestamp();

END IF;

INSERT INTO risksmart."sso_configuration_audit" ("Id", "OrgKey", "Name", "Strategy", "ClientId", "ConnectionId", "Domain", "DomainAliases",
                                                 "IsActive", "IsRestApiEnabled", "IsOrganizationConnected",
                                                 "CreatedByUser", "CreatedAtTimestamp", "ModifiedByUser",
                                                 "ModifiedAtTimestamp", "Action")
VALUES (nr."Id",
        nr."OrgKey",
        nr."Name",
        nr."Strategy",
        nr."ClientId",
        nr."ConnectionId",
        nr."Domain",
        nr."DomainAliases",
        nr."IsActive",
        nr."IsRestApiEnabled",
        nr."IsOrganizationConnected",
        nr."CreatedByUser",
        nr."CreatedAtTimestamp",
        updated_user,
        update_timestamp,
        TG_OP);

RETURN NULL;

END;

$body$
LANGUAGE plpgsql;

ALTER TABLE risksmart.sso_configuration_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.sso_configuration ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER node_insert_trigger
  BEFORE INSERT
  ON risksmart.sso_configuration
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_insert();

CREATE TRIGGER node_delete_trigger
  AFTER DELETE
  ON risksmart.sso_configuration
  FOR EACH ROW
EXECUTE FUNCTION risksmart.node_delete();

ALTER TABLE risksmart.sso_configuration
ADD CONSTRAINT "sso_configuration_id_fkey" FOREIGN KEY ("Id") REFERENCES risksmart.node("Id");

CREATE TRIGGER sso_configuration_audit_trigger
  AFTER
    INSERT
    OR
DELETE
OR
UPDATE ON risksmart.sso_configuration FOR EACH ROW EXECUTE FUNCTION risksmart.sso_configuration_modified();

CREATE
POLICY own_org ON risksmart.sso_configuration_audit TO reporting USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE
POLICY own_org ON risksmart.sso_configuration TO reporting USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE
POLICY own_org_rw ON risksmart.sso_configuration_audit TO trpc USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE
POLICY own_org_rw ON risksmart.sso_configuration TO trpc USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE
POLICY own_org_data_layer ON risksmart.sso_configuration_audit FOR ALL TO data_layer USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE
POLICY own_org_data_layer ON risksmart.sso_configuration FOR ALL TO data_layer USING (
  "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
  "OrgKey" = current_setting('risksmart.org_key', 't')
);

-- Update audit log view (based on 1772533751401_ingestion_config_table with sso_configuration_audit appended)
CREATE OR REPLACE VIEW risksmart.audit_log_view AS
SELECT NULL::text AS "Item",
  'tag'::text AS "ObjectType",
  tag_audit."TagTypeId"::text AS "Id",
  tag_audit."Action",
  tag_audit."ModifiedByUser",
  tag_audit."ModifiedAtTimestamp",
  tag_audit."OrgKey"
FROM risksmart.tag_audit
UNION ALL
SELECT NULL::text AS "Item",
  'department'::text AS "ObjectType",
  department_audit."DepartmentTypeId"::text AS "Id",
  department_audit."Action",
  department_audit."ModifiedByUser",
  department_audit."ModifiedAtTimestamp",
  department_audit."OrgKey"
FROM risksmart.department_audit
UNION ALL
SELECT file_audit."FileName" AS "Item",
  'file'::text AS "ObjectType",
  file_audit."Id"::text AS "Id",
  file_audit."Action",
  file_audit."ModifiedByUser",
  file_audit."ModifiedAtTimestamp",
  file_audit."OrgKey"
FROM risksmart.file_audit
UNION ALL
SELECT NULL::text AS "Item",
  'relation_file'::text AS "ObjectType",
  relation_file_audit."ParentId"::text AS "Id",
  relation_file_audit."Action",
  relation_file_audit."ModifiedByUser",
  relation_file_audit."ModifiedAtTimestamp",
  relation_file_audit."OrgKey"
FROM risksmart.relation_file_audit
UNION ALL
SELECT NULL::text AS "Item",
  'control_action'::text AS "ObjectType",
  control_action_audit."ControlId"::text AS "Id",
  control_action_audit."Action",
  control_action_audit."ModifiedByUser",
  control_action_audit."ModifiedAtTimestamp",
  control_action_audit."OrgKey"
FROM risksmart.control_action_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_action'::text AS "ObjectType",
  risk_action_audit."RiskId"::text AS "Id",
  risk_action_audit."Action",
  risk_action_audit."ModifiedByUser",
  risk_action_audit."ModifiedAtTimestamp",
  risk_action_audit."OrgKey"
FROM risksmart.risk_action_audit
UNION ALL
SELECT NULL::text AS "Item",
  'issue_action'::text AS "ObjectType",
  issue_action_audit."IssueId"::text AS "Id",
  issue_action_audit."Action",
  issue_action_audit."ModifiedByUser",
  issue_action_audit."ModifiedAtTimestamp",
  issue_action_audit."OrgKey"
FROM risksmart.issue_action_audit
UNION ALL
SELECT NULL::text AS "Item",
  'obligation_action'::text AS "ObjectType",
  obligation_action_audit."ObligationId"::text AS "Id",
  obligation_action_audit."Action",
  obligation_action_audit."ModifiedByUser",
  obligation_action_audit."ModifiedAtTimestamp",
  obligation_action_audit."OrgKey"
FROM risksmart.obligation_action_audit
UNION ALL
SELECT NULL::text AS "Item",
  'obligation_issue'::text AS "ObjectType",
  obligation_issue_audit."ObligationId"::text AS "Id",
  obligation_issue_audit."Action",
  obligation_issue_audit."ModifiedByUser",
  obligation_issue_audit."ModifiedAtTimestamp",
  obligation_issue_audit."OrgKey"
FROM risksmart.obligation_issue_audit
UNION ALL
SELECT NULL::text AS "Item",
  'document_linked_document'::text AS "ObjectType",
  document_linked_document_audit."DocumentId"::text AS "Id",
  document_linked_document_audit."Action",
  document_linked_document_audit."ModifiedByUser",
  document_linked_document_audit."ModifiedAtTimestamp",
  document_linked_document_audit."OrgKey"
FROM risksmart.document_linked_document_audit
UNION ALL
SELECT NULL::text AS "Item",
  'document_action'::text AS "ObjectType",
  document_action_audit."DocumentId"::text AS "Id",
  document_action_audit."Action",
  document_action_audit."ModifiedByUser",
  document_action_audit."ModifiedAtTimestamp",
  document_action_audit."OrgKey"
FROM risksmart.document_action_audit
UNION ALL
SELECT NULL::text AS "Item",
  'document_issue'::text AS "ObjectType",
  document_issue_audit."DocumentId"::text AS "Id",
  document_issue_audit."Action",
  document_issue_audit."ModifiedByUser",
  document_issue_audit."ModifiedAtTimestamp",
  document_issue_audit."OrgKey"
FROM risksmart.document_issue_audit
UNION ALL
SELECT NULL::text AS "Item",
  'custom_attribute_schema'::text AS "ObjectType",
  custom_attribute_schema_audit."Id"::text AS "Id",
  custom_attribute_schema_audit."Action",
  custom_attribute_schema_audit."ModifiedByUser",
  custom_attribute_schema_audit."ModifiedAtTimestamp",
  custom_attribute_schema_audit."OrgKey"
FROM risksmart.custom_attribute_schema_audit
UNION ALL
SELECT acceptance_audit."Title" AS "Item",
  'acceptance'::text AS "ObjectType",
  acceptance_audit."Id"::text AS "Id",
  acceptance_audit."Action",
  acceptance_audit."ModifiedByUser",
  acceptance_audit."ModifiedAtTimestamp",
  acceptance_audit."OrgKey"
FROM risksmart.acceptance_audit
UNION ALL
SELECT NULL::text AS "Item",
  'comment'::text AS "ObjectType",
  comment_audit."Id"::text AS "Id",
  comment_audit."Action",
  comment_audit."ModifiedByUser",
  comment_audit."ModifiedAtTimestamp",
  comment_audit."OrgKey"
FROM risksmart.comment_audit
UNION ALL
SELECT NULL::text AS "Item",
  'obligation_impact'::text AS "ObjectType",
  obligation_impact_audit."Id"::text AS "Id",
  obligation_impact_audit."Action",
  obligation_impact_audit."ModifiedByUser",
  obligation_impact_audit."ModifiedAtTimestamp",
  obligation_impact_audit."OrgKey"
FROM risksmart.obligation_impact_audit
UNION ALL
SELECT NULL::text AS "Item",
  'appetite'::text AS "ObjectType",
  appetite_audit."Id"::text AS "Id",
  appetite_audit."Action",
  appetite_audit."ModifiedByUser",
  appetite_audit."ModifiedAtTimestamp",
  appetite_audit."OrgKey"
FROM risksmart.appetite_audit
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue'::text
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue_breach_log'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue_breach_log'::text
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue_sar_log'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue_sar_log'::text
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue_gdpr_breach_log'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue_gdpr_breach_log'::text
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue_pci_breach_log'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue_pci_breach_log'::text
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue_consumer_duty'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue_consumer_duty'::text
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue_customer_trust'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue_customer_trust'::text
UNION ALL
SELECT issue_audit."Title" AS "Item",
  'issue_risk_event'::text AS "ObjectType",
  issue_audit."Id"::text AS "Id",
  issue_audit."Action",
  issue_audit."ModifiedByUser",
  issue_audit."ModifiedAtTimestamp",
  issue_audit."OrgKey"
FROM risksmart.issue_audit
WHERE issue_audit."Type" = 'issue_risk_event'::text
UNION ALL
SELECT action_update_audit."Title" AS "Item",
  'action_update'::text AS "ObjectType",
  action_update_audit."Id"::text AS "Id",
  action_update_audit."Action",
  action_update_audit."ModifiedByUser",
  action_update_audit."ModifiedAtTimestamp",
  action_update_audit."OrgKey"
FROM risksmart.action_update_audit
UNION ALL
SELECT NULL::text AS "Item",
  'control_group'::text AS "ObjectType",
  control_group_audit."Id"::text AS "Id",
  control_group_audit."Action",
  control_group_audit."ModifiedByUser",
  control_group_audit."ModifiedAtTimestamp",
  control_group_audit."OrgKey"
FROM risksmart.control_group_audit
UNION ALL
SELECT NULL::text AS "Item",
  'indicator_result'::text AS "ObjectType",
  indicator_result_audit."Id"::text AS "Id",
  indicator_result_audit."Action",
  indicator_result_audit."ModifiedByUser",
  indicator_result_audit."ModifiedAtTimestamp",
  indicator_result_audit."OrgKey"
FROM risksmart.indicator_result_audit
UNION ALL
SELECT issue_update_audit."Title" AS "Item",
  'issue_update'::text AS "ObjectType",
  issue_update_audit."Id"::text AS "Id",
  issue_update_audit."Action",
  issue_update_audit."ModifiedByUser",
  issue_update_audit."ModifiedAtTimestamp",
  issue_update_audit."OrgKey"
FROM risksmart.issue_update_audit
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment'::text
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment_breach_log'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment_breach_log'::text
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment_sar_log'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment_sar_log'::text
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment_gdpr_breach_log'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment_gdpr_breach_log'::text
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment_pci_breach_log'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment_pci_breach_log'::text
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment_consumer_duty'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment_consumer_duty'::text
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment_customer_trust'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment_customer_trust'::text
UNION ALL
SELECT NULL::text AS "Item",
  'issue_assessment_risk_event'::text AS "ObjectType",
  issue_assessment_audit."Id"::text AS "Id",
  issue_assessment_audit."Action",
  issue_assessment_audit."ModifiedByUser",
  issue_assessment_audit."ModifiedAtTimestamp",
  issue_assessment_audit."OrgKey"
FROM risksmart.issue_assessment_audit
WHERE issue_assessment_audit."Type" = 'issue_assessment_risk_event'::text
UNION ALL
SELECT cause_audit."Title" AS "Item",
  'cause'::text AS "ObjectType",
  cause_audit."Id"::text AS "Id",
  cause_audit."Action",
  cause_audit."ModifiedByUser",
  cause_audit."ModifiedAtTimestamp",
  cause_audit."OrgKey"
FROM risksmart.cause_audit
UNION ALL
SELECT test_result_audit."Title" AS "Item",
  'test_result'::text AS "ObjectType",
  test_result_audit."Id"::text AS "Id",
  test_result_audit."Action",
  test_result_audit."ModifiedByUser",
  test_result_audit."ModifiedAtTimestamp",
  test_result_audit."OrgKey"
FROM risksmart.test_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'taxonomy'::text AS "ObjectType",
  taxonomy_audit."Id"::text AS "Id",
  taxonomy_audit."Action",
  taxonomy_audit."ModifiedByUser",
  taxonomy_audit."ModifiedAtTimestamp",
  NULL::text AS "OrgKey"
FROM risksmart.taxonomy_audit
UNION ALL
SELECT NULL::text AS "Item",
  'taxonomy_org'::text AS "ObjectType",
  taxonomy_org_audit."Id"::text AS "Id",
  taxonomy_org_audit."Action",
  taxonomy_org_audit."ModifiedByUser",
  taxonomy_org_audit."ModifiedAtTimestamp",
  taxonomy_org_audit."OrgKey"
FROM risksmart.taxonomy_org_audit
UNION ALL
SELECT NULL::text AS "Item",
  'contributor'::text AS "ObjectType",
  contributor_audit."ParentId"::text AS "Id",
  contributor_audit."Action",
  contributor_audit."ModifiedByUser",
  contributor_audit."ModifiedAtTimestamp",
  contributor_audit."OrgKey"
FROM risksmart.contributor_audit
UNION ALL
SELECT NULL::text AS "Item",
  'owner'::text AS "ObjectType",
  owner_audit."ParentId"::text AS "Id",
  owner_audit."Action",
  owner_audit."ModifiedByUser",
  owner_audit."ModifiedAtTimestamp",
  owner_audit."OrgKey"
FROM risksmart.owner_audit
UNION ALL
SELECT NULL::text AS "Item",
  'approval'::text AS "ObjectType",
  approval_audit."Id"::text AS "Id",
  approval_audit."Action",
  approval_audit."ModifiedByUser",
  approval_audit."ModifiedAtTimestamp",
  approval_audit."OrgKey"
FROM risksmart.approval_audit
UNION ALL
SELECT NULL::text AS "Item",
  'approval_level'::text AS "ObjectType",
  approval_level_audit."Id"::text AS "Id",
  approval_level_audit."Action",
  approval_level_audit."ModifiedByUser",
  approval_level_audit."ModifiedAtTimestamp",
  approval_level_audit."OrgKey"
FROM risksmart.approval_level_audit
UNION ALL
SELECT NULL::text AS "Item",
  'approver'::text AS "ObjectType",
  approver_audit."Id"::text AS "Id",
  approver_audit."Action",
  approver_audit."ModifiedByUser",
  approver_audit."ModifiedAtTimestamp",
  approver_audit."OrgKey"
FROM risksmart.approver_audit
UNION ALL
SELECT NULL::text AS "Item",
  'action_parent'::text AS "ObjectType",
  action_parent_audit."ActionId"::text AS "Id",
  action_parent_audit."Action",
  action_parent_audit."ModifiedByUser",
  action_parent_audit."ModifiedAtTimestamp",
  action_parent_audit."OrgKey"
FROM risksmart.action_parent_audit
UNION ALL
SELECT NULL::text AS "Item",
  'control_parent'::text AS "ObjectType",
  control_parent_audit."ControlId"::text AS "Id",
  control_parent_audit."Action",
  control_parent_audit."ModifiedByUser",
  control_parent_audit."ModifiedAtTimestamp",
  control_parent_audit."OrgKey"
FROM risksmart.control_parent_audit
UNION ALL
SELECT form_configuration_audit."ParentType" AS "Item",
  'form_configuration'::text AS "ObjectType",
  NULL::text AS "Id",
  form_configuration_audit."Action",
  form_configuration_audit."ModifiedByUser",
  form_configuration_audit."ModifiedAtTimestamp",
  form_configuration_audit."OrgKey"
FROM risksmart.form_configuration_audit
UNION ALL
SELECT NULL::text AS "Item",
  'indicator_parent'::text AS "ObjectType",
  indicator_parent_audit."ParentId"::text AS "Id",
  indicator_parent_audit."Action",
  indicator_parent_audit."ModifiedByUser",
  indicator_parent_audit."ModifiedAtTimestamp",
  indicator_parent_audit."OrgKey"
FROM risksmart.indicator_parent_audit
UNION ALL
SELECT action_audit."Title" AS "Item",
  'action'::text AS "ObjectType",
  action_audit."Id"::text AS "Id",
  action_audit."Action",
  action_audit."ModifiedByUser",
  action_audit."ModifiedAtTimestamp",
  action_audit."OrgKey"
FROM risksmart.action_audit
UNION ALL
SELECT risk_audit."Title" AS "Item",
  'risk'::text AS "ObjectType",
  risk_audit."Id"::text AS "Id",
  risk_audit."Action",
  risk_audit."ModifiedByUser",
  risk_audit."ModifiedAtTimestamp",
  risk_audit."OrgKey"
FROM risksmart.risk_audit
UNION ALL
SELECT control_audit."Title" AS "Item",
  'control'::text AS "ObjectType",
  control_audit."Id"::text AS "Id",
  control_audit."Action",
  control_audit."ModifiedByUser",
  control_audit."ModifiedAtTimestamp",
  control_audit."OrgKey"
FROM risksmart.control_audit
UNION ALL
SELECT document_audit."Title" AS "Item",
  'document'::text AS "ObjectType",
  document_audit."Id"::text AS "Id",
  document_audit."Action",
  document_audit."ModifiedByUser",
  document_audit."ModifiedAtTimestamp",
  document_audit."OrgKey"
FROM risksmart.document_audit
UNION ALL
SELECT NULL::text AS "Item",
  'form_field_configuration'::text AS "ObjectType",
  NULL::text AS "Id",
  form_field_configuration_audit."Action",
  form_field_configuration_audit."ModifiedByUser",
  form_field_configuration_audit."ModifiedAtTimestamp",
  form_field_configuration_audit."OrgKey"
FROM risksmart.form_field_configuration_audit
UNION ALL
SELECT obligation_audit."Title" AS "Item",
  'obligation'::text AS "ObjectType",
  obligation_audit."Id"::text AS "Id",
  obligation_audit."Action",
  obligation_audit."ModifiedByUser",
  obligation_audit."ModifiedAtTimestamp",
  obligation_audit."OrgKey"
FROM risksmart.obligation_audit
UNION ALL
SELECT NULL::text AS "Item",
  'issue_parent'::text AS "ObjectType",
  issue_parent_audit."ParentId"::text AS "Id",
  issue_parent_audit."Action",
  issue_parent_audit."ModifiedByUser",
  issue_parent_audit."ModifiedAtTimestamp",
  issue_parent_audit."OrgKey"
FROM risksmart.issue_parent_audit
UNION ALL
SELECT NULL::text AS "Item",
  'owner_group'::text AS "ObjectType",
  owner_group_audit."ParentId"::text AS "Id",
  owner_group_audit."Action",
  owner_group_audit."ModifiedByUser",
  owner_group_audit."ModifiedAtTimestamp",
  owner_group_audit."OrgKey"
FROM risksmart.owner_group_audit
UNION ALL
SELECT NULL::text AS "Item",
  'contributor_group'::text AS "ObjectType",
  contributor_group_audit."ParentId"::text AS "Id",
  contributor_group_audit."Action",
  contributor_group_audit."ModifiedByUser",
  contributor_group_audit."ModifiedAtTimestamp",
  contributor_group_audit."OrgKey"
FROM risksmart.contributor_group_audit
UNION ALL
SELECT NULL::text AS "Item",
  'user_group_users'::text AS "ObjectType",
  user_group_user_audit."UserGroupId"::text AS "Id",
  user_group_user_audit."Action",
  user_group_user_audit."ModifiedByUser",
  user_group_user_audit."ModifiedAtTimestamp",
  user_group_user_audit."OrgKey"
FROM risksmart.user_group_user_audit
UNION ALL
SELECT NULL::text AS "Item",
  'conversation'::text AS "ObjectType",
  conversation_audit."Id"::text AS "Id",
  conversation_audit."Action",
  conversation_audit."ModifiedByUser",
  conversation_audit."ModifiedAtTimestamp",
  conversation_audit."OrgKey"
FROM risksmart.conversation_audit
UNION ALL
SELECT consequence_audit."Title" AS "Item",
  'consequence'::text AS "ObjectType",
  consequence_audit."Id"::text AS "Id",
  consequence_audit."Action",
  consequence_audit."ModifiedByUser",
  consequence_audit."ModifiedAtTimestamp",
  consequence_audit."OrgKey"
FROM risksmart.consequence_audit
UNION ALL
SELECT assessment_audit."Title" AS "Item",
  'assessment'::text AS "ObjectType",
  assessment_audit."Id"::text AS "Id",
  assessment_audit."Action",
  assessment_audit."ModifiedByUser",
  assessment_audit."ModifiedAtTimestamp",
  assessment_audit."OrgKey"
FROM risksmart.assessment_audit
UNION ALL
SELECT impact_audit."Name" AS "Item",
  'impact'::text AS "ObjectType",
  impact_audit."Id"::text AS "Id",
  impact_audit."Action",
  impact_audit."ModifiedByUser",
  impact_audit."ModifiedAtTimestamp",
  impact_audit."OrgKey"
FROM risksmart.impact_audit
UNION ALL
SELECT NULL::text AS "Item",
  'obligation_assessment_result'::text AS "ObjectType",
  obligation_assessment_result_audit."Id"::text AS "Id",
  obligation_assessment_result_audit."Action",
  obligation_assessment_result_audit."ModifiedByUser",
  obligation_assessment_result_audit."ModifiedAtTimestamp",
  obligation_assessment_result_audit."OrgKey"
FROM risksmart.obligation_assessment_result_audit
UNION ALL
SELECT tag_type_group_audit."Name" AS "Item",
  'tag_type_group'::text AS "ObjectType",
  tag_type_group_audit."Id"::text AS "Id",
  tag_type_group_audit."Action",
  tag_type_group_audit."ModifiedByUser",
  tag_type_group_audit."ModifiedAtTimestamp",
  tag_type_group_audit."OrgKey"
FROM risksmart.tag_type_group_audit
UNION ALL
SELECT tag_type_audit."Name" AS "Item",
  'tag_type'::text AS "ObjectType",
  tag_type_audit."Id"::text AS "Id",
  tag_type_audit."Action",
  tag_type_audit."ModifiedByUser",
  tag_type_audit."ModifiedAtTimestamp",
  tag_type_audit."OrgKey"
FROM risksmart.tag_type_audit
UNION ALL
SELECT NULL::text AS "Item",
  'impact_rating'::text AS "ObjectType",
  impact_rating_audit."Id"::text AS "Id",
  impact_rating_audit."Action",
  impact_rating_audit."ModifiedByUser",
  impact_rating_audit."ModifiedAtTimestamp",
  impact_rating_audit."OrgKey"
FROM risksmart.impact_rating_audit
UNION ALL
SELECT indicator_audit."Title" AS "Item",
  'indicator_audit'::text AS "ObjectType",
  indicator_audit."Id"::text AS "Id",
  indicator_audit."Action",
  indicator_audit."ModifiedByUser",
  indicator_audit."ModifiedAtTimestamp",
  indicator_audit."OrgKey"
FROM risksmart.indicator_audit
UNION ALL
SELECT department_type_group_audit."Name" AS "Item",
  'department_type_group'::text AS "ObjectType",
  department_type_group_audit."Id"::text AS "Id",
  department_type_group_audit."Action",
  department_type_group_audit."ModifiedByUser",
  department_type_group_audit."ModifiedAtTimestamp",
  department_type_group_audit."OrgKey"
FROM risksmart.department_type_group_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_assessment_result'::text AS "ObjectType",
  risk_assessment_result_audit."Id"::text AS "Id",
  risk_assessment_result_audit."Action",
  risk_assessment_result_audit."ModifiedByUser",
  risk_assessment_result_audit."ModifiedAtTimestamp",
  risk_assessment_result_audit."OrgKey"
FROM risksmart.risk_assessment_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'document_assessment_result'::text AS "ObjectType",
  document_assessment_result_audit."Id"::text AS "Id",
  document_assessment_result_audit."Action",
  document_assessment_result_audit."ModifiedByUser",
  document_assessment_result_audit."ModifiedAtTimestamp",
  document_assessment_result_audit."OrgKey"
FROM risksmart.document_assessment_result_audit
UNION ALL
SELECT department_type_audit."Name" AS "Item",
  'department_type'::text AS "ObjectType",
  department_type_audit."Id"::text AS "Id",
  department_type_audit."Action",
  department_type_audit."ModifiedByUser",
  department_type_audit."ModifiedAtTimestamp",
  department_type_audit."OrgKey"
FROM risksmart.department_type_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_assessment'::text AS "ObjectType",
  old_risk_assessment_audit."Id"::text AS "Id",
  old_risk_assessment_audit."Action",
  old_risk_assessment_audit."ModifiedByUser",
  old_risk_assessment_audit."ModifiedAtTimestamp",
  old_risk_assessment_audit."OrgKey"
FROM risksmart.old_risk_assessment_audit
UNION ALL
SELECT NULL::text AS "Item",
  'document_assessment'::text AS "ObjectType",
  old_document_assessment_audit."Id"::text AS "Id",
  old_document_assessment_audit."Action",
  old_document_assessment_audit."ModifiedByUser",
  old_document_assessment_audit."ModifiedAtTimestamp",
  old_document_assessment_audit."OrgKey"
FROM risksmart.old_document_assessment_audit
UNION ALL
SELECT NULL::text AS "Item",
  'obligation_assessment'::text AS "ObjectType",
  old_obligation_assessment_audit."Id"::text AS "Id",
  old_obligation_assessment_audit."Action",
  old_obligation_assessment_audit."ModifiedByUser",
  old_obligation_assessment_audit."ModifiedAtTimestamp",
  old_obligation_assessment_audit."OrgKey"
FROM risksmart.old_obligation_assessment_audit
UNION ALL
SELECT user_group_audit."Name" AS "Item",
  'user_group'::text AS "ObjectType",
  user_group_audit."Id"::text AS "Id",
  user_group_audit."Action",
  user_group_audit."ModifiedByUser",
  user_group_audit."ModifiedAtTimestamp",
  user_group_audit."OrgKey"
FROM risksmart.user_group_audit
UNION ALL
SELECT document_file_audit."Version" AS "Item",
  'document_file'::text AS "ObjectType",
  document_file_audit."Id"::text AS "Id",
  document_file_audit."Action",
  document_file_audit."ModifiedByUser",
  document_file_audit."ModifiedAtTimestamp",
  document_file_audit."OrgKey"
FROM risksmart.document_file_audit
UNION ALL
SELECT NULL::text AS "Item",
  'linked_item'::text AS "ObjectType",
  linked_item_audit."Id"::text AS "Id",
  linked_item_audit."Action",
  linked_item_audit."ModifiedByUser",
  linked_item_audit."ModifiedAtTimestamp",
  linked_item_audit."OrgKey"
FROM risksmart.linked_item_audit
UNION ALL
SELECT NULL::text AS "Item",
  'acceptance_parent'::text AS "ObjectType",
  acceptance_parent_audit."Id"::text AS "Id",
  acceptance_parent_audit."Action",
  acceptance_parent_audit."ModifiedByUser",
  acceptance_parent_audit."ModifiedAtTimestamp",
  acceptance_parent_audit."OrgKey"
FROM risksmart.acceptance_parent_audit
UNION ALL
SELECT NULL::text AS "Item",
  'assessment_result_parent'::text AS "ObjectType",
  assessment_result_parent_audit."Id"::text AS "Id",
  assessment_result_parent_audit."Action",
  assessment_result_parent_audit."ModifiedByUser",
  assessment_result_parent_audit."ModifiedAtTimestamp",
  assessment_result_parent_audit."OrgKey"
FROM risksmart.assessment_result_parent_audit
UNION ALL
SELECT NULL::text AS "Item",
  'change_request_contributor'::text AS "ObjectType",
  change_request_contributor_audit."Id"::text AS "Id",
  change_request_contributor_audit."Action",
  NULL::text AS "ModifiedByUser",
  change_request_contributor_audit."ModifiedAtTimestamp",
  change_request_contributor_audit."OrgKey"
FROM risksmart.change_request_contributor_audit
UNION ALL
SELECT NULL::text AS "Item",
  'appetite_parent'::text AS "ObjectType",
  appetite_parent_audit."Id"::text AS "Id",
  appetite_parent_audit."Action",
  appetite_parent_audit."ModifiedByUser",
  appetite_parent_audit."ModifiedAtTimestamp",
  appetite_parent_audit."OrgKey"
FROM risksmart.appetite_parent_audit
UNION ALL
SELECT NULL::text AS "Item",
  'impact_parent'::text AS "ObjectType",
  impact_parent_audit."ParentId"::text AS "Id",
  impact_parent_audit."Action",
  impact_parent_audit."ModifiedByUser",
  impact_parent_audit."ModifiedAtTimestamp",
  impact_parent_audit."OrgKey"
FROM risksmart.impact_parent_audit
UNION ALL
SELECT assessment_activity_audit."Title" AS "Item",
  'assessment_activity'::text AS "ObjectType",
  assessment_activity_audit."Id"::text AS "Id",
  assessment_activity_audit."Action",
  assessment_activity_audit."ModifiedByUser",
  assessment_activity_audit."ModifiedAtTimestamp",
  assessment_activity_audit."OrgKey"
FROM risksmart.assessment_activity_audit
UNION ALL
SELECT NULL::text AS "Item",
  'change_request'::text AS "ObjectType",
  change_request_audit."Id"::text AS "Id",
  change_request_audit."Action",
  change_request_audit."ModifiedByUser",
  change_request_audit."ModifiedAtTimestamp",
  change_request_audit."OrgKey"
FROM risksmart.change_request_audit
UNION ALL
SELECT internal_audit_report_audit."Title" AS "Item",
  'internal_audit_report'::text AS "ObjectType",
  internal_audit_report_audit."Id"::text AS "Id",
  internal_audit_report_audit."Action",
  internal_audit_report_audit."ModifiedByUser",
  internal_audit_report_audit."ModifiedAtTimestamp",
  internal_audit_report_audit."OrgKey"
FROM risksmart.internal_audit_report_audit
UNION ALL
SELECT NULL::text AS "Item",
  'user_search_preferences'::text AS "ObjectType",
  NULL::text AS "Id",
  user_search_preferences_audit."Action",
  user_search_preferences_audit."ModifiedByUser",
  user_search_preferences_audit."ModifiedAtTimestamp",
  user_search_preferences_audit."OrgKey"
FROM risksmart.user_search_preferences_audit
UNION ALL
SELECT NULL::text AS "Item",
  'custom_ribbon'::text AS "ObjectType",
  custom_ribbon_audit."Id"::text AS "Id",
  custom_ribbon_audit."Action",
  custom_ribbon_audit."ModifiedByUser",
  custom_ribbon_audit."ModifiedAtTimestamp",
  custom_ribbon_audit."OrgKey"
FROM risksmart.custom_ribbon_audit
UNION ALL
SELECT compliance_monitoring_assessment_audit."Title" AS "Item",
  'compliance_monitoring_assessment'::text AS "ObjectType",
  compliance_monitoring_assessment_audit."Id"::text AS "Id",
  compliance_monitoring_assessment_audit."Action",
  compliance_monitoring_assessment_audit."ModifiedByUser",
  compliance_monitoring_assessment_audit."ModifiedAtTimestamp",
  compliance_monitoring_assessment_audit."OrgKey"
FROM risksmart.compliance_monitoring_assessment_audit
UNION ALL
SELECT business_area_audit."Title" AS "Item",
  'business_area'::text AS "ObjectType",
  business_area_audit."Id"::text AS "Id",
  business_area_audit."Action",
  business_area_audit."ModifiedByUser",
  business_area_audit."ModifiedAtTimestamp",
  business_area_audit."OrgKey"
FROM risksmart.business_area_audit
UNION ALL
SELECT internal_audit_entity_audit."Title" AS "Item",
  'internal_audit_entity'::text AS "ObjectType",
  internal_audit_entity_audit."Id"::text AS "Id",
  internal_audit_entity_audit."Action",
  internal_audit_entity_audit."ModifiedByUser",
  internal_audit_entity_audit."ModifiedAtTimestamp",
  internal_audit_entity_audit."OrgKey"
FROM risksmart.internal_audit_entity_audit
UNION ALL
SELECT dashboard_audit."Name" AS "Item",
  'dashboard'::text AS "ObjectType",
  dashboard_audit."Id"::text AS "Id",
  dashboard_audit."Action",
  dashboard_audit."ModifiedByUser",
  dashboard_audit."ModifiedAtTimestamp",
  dashboard_audit."OrgKey"
FROM risksmart.dashboard_audit
UNION ALL
SELECT NULL::text AS "Item",
  'approver_response'::text AS "ObjectType",
  approver_response_audit."Id"::text AS "Id",
  approver_response_audit."Action",
  approver_response_audit."ModifiedByUser",
  approver_response_audit."ModifiedAtTimestamp",
  NULL::text AS "OrgKey"
FROM risksmart.approver_response_audit
UNION ALL
SELECT NULL::text AS "Item",
  'attestation_group'::text AS "ObjectType",
  attestation_group_audit."GroupId"::text AS "Id",
  attestation_group_audit."Action",
  attestation_group_audit."ModifiedByUser",
  attestation_group_audit."ModifiedAtTimestamp",
  attestation_group_audit."OrgKey"
FROM risksmart.attestation_group_audit
UNION ALL
SELECT NULL::text AS "Item",
  'attestation_record'::text AS "ObjectType",
  attestation_record_audit."Id"::text AS "Id",
  attestation_record_audit."Action",
  attestation_record_audit."ModifiedByUser",
  attestation_record_audit."ModifiedAtTimestamp",
  attestation_record_audit."OrgKey"
FROM risksmart.attestation_record_audit
UNION ALL
SELECT NULL::text AS "Item",
  'attestation_config'::text AS "ObjectType",
  attestation_config_audit."ParentId"::text AS "Id",
  attestation_config_audit."Action",
  attestation_config_audit."ModifiedByUser",
  attestation_config_audit."ModifiedAtTimestamp",
  attestation_config_audit."OrgKey"
FROM risksmart.attestation_config_audit
UNION ALL
SELECT third_party_audit."Title" AS "Item",
  'third_party'::text AS "ObjectType",
  third_party_audit."Id"::text AS "Id",
  third_party_audit."Action",
  third_party_audit."ModifiedByUser",
  third_party_audit."ModifiedAtTimestamp",
  third_party_audit."OrgKey"
FROM risksmart.third_party_audit
UNION ALL
SELECT 'Authentication'::text AS "Item",
  'user_activity'::text AS "ObjectType",
  user_activity_audit."ModifiedByUser" AS "Id",
  user_activity_audit."Action",
  user_activity_audit."ModifiedByUser",
  user_activity_audit."ModifiedAtTimestamp",
  user_activity_audit."OrgKey"
FROM auth.user_activity_audit
UNION ALL
SELECT enterprise_risk_audit."Title" AS "Item",
  'enterprise_risk'::text AS "ObjectType",
  enterprise_risk_audit."ModifiedByUser" AS "Id",
  enterprise_risk_audit."Action",
  enterprise_risk_audit."ModifiedByUser",
  enterprise_risk_audit."ModifiedAtTimestamp",
  enterprise_risk_audit."OrgKey"
FROM risksmart.enterprise_risk_audit
UNION ALL
SELECT NULL::text AS "Item",
  'enterprise_risk_instance'::text AS "ObjectType",
  enterprise_risk_instance_audit."ModifiedByUser" AS "Id",
  enterprise_risk_instance_audit."Action",
  enterprise_risk_instance_audit."ModifiedByUser",
  enterprise_risk_instance_audit."ModifiedAtTimestamp",
  enterprise_risk_instance_audit."OrgKey"
FROM risksmart.enterprise_risk_instance_audit
UNION ALL
SELECT NULL::text AS "Item",
  'schedule'::text AS "ObjectType",
  schedule_audit."ModifiedByUser" AS "Id",
  schedule_audit."Action",
  schedule_audit."ModifiedByUser",
  schedule_audit."ModifiedAtTimestamp",
  schedule_audit."OrgKey"
FROM risksmart.schedule_audit
UNION ALL
SELECT questionnaire_template_audit."Title" AS "Item",
  'questionnaire_template'::text AS "ObjectType",
  questionnaire_template_audit."ModifiedByUser" AS "Id",
  questionnaire_template_audit."Action",
  questionnaire_template_audit."ModifiedByUser",
  questionnaire_template_audit."ModifiedAtTimestamp",
  questionnaire_template_audit."OrgKey"
FROM risksmart.questionnaire_template_audit
UNION ALL
SELECT NULL::text AS "Item",
  'questionnaire_invite'::text AS "ObjectType",
  questionnaire_invite_audit."ModifiedByUser" AS "Id",
  questionnaire_invite_audit."Action",
  questionnaire_invite_audit."ModifiedByUser",
  questionnaire_invite_audit."ModifiedAtTimestamp",
  questionnaire_invite_audit."OrgKey"
FROM risksmart.questionnaire_invite_audit
UNION ALL
SELECT NULL::text AS "Item",
  'questionnaire_template_version'::text AS "ObjectType",
  questionnaire_template_version_audit."ModifiedByUser" AS "Id",
  questionnaire_template_version_audit."Action",
  questionnaire_template_version_audit."ModifiedByUser",
  questionnaire_template_version_audit."ModifiedAtTimestamp",
  questionnaire_template_version_audit."OrgKey"
FROM risksmart.questionnaire_template_version_audit
UNION ALL
SELECT NULL::text AS "Item",
  'third_party_response'::text AS "ObjectType",
  third_party_response_audit."ModifiedByUser" AS "Id",
  third_party_response_audit."Action",
  third_party_response_audit."ModifiedByUser",
  third_party_response_audit."ModifiedAtTimestamp",
  third_party_response_audit."OrgKey"
FROM risksmart.third_party_response_audit
UNION ALL
SELECT NULL::text AS "Item",
  'entity'::text AS "ObjectType",
  entity_audit."ModifiedByUser" AS "Id",
  entity_audit."Action",
  entity_audit."ModifiedByUser",
  entity_audit."ModifiedAtTimestamp",
  entity_audit."OrgKey"
FROM risksmart.entity_audit
UNION ALL
SELECT NULL::text AS "Item",
  'wizard'::text AS "ObjectType",
  wizard_audit."ModifiedByUser" AS "Id",
  wizard_audit."Action",
  wizard_audit."ModifiedByUser",
  wizard_audit."ModifiedAtTimestamp",
  wizard_audit."OrgKey"
FROM risksmart.wizard_audit
UNION ALL
SELECT NULL::text AS "Item",
  'custom_datasource'::text AS "ObjectType",
  custom_datasource_audit."ModifiedByUser" AS "Id",
  custom_datasource_audit."Action",
  custom_datasource_audit."ModifiedByUser",
  custom_datasource_audit."ModifiedAtTimestamp",
  custom_datasource_audit."OrgKey"
FROM risksmart.custom_datasource_audit
UNION ALL
SELECT NULL::text AS "Item",
  'impact_second_line_rating_audit'::text AS "ObjectType",
  impact_second_line_rating_audit."ModifiedByUser" AS "Id",
  impact_second_line_rating_audit."Action",
  impact_second_line_rating_audit."ModifiedByUser",
  impact_second_line_rating_audit."ModifiedAtTimestamp",
  impact_second_line_rating_audit."OrgKey"
FROM risksmart.impact_second_line_rating_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_uncontrolled_internal_audit_result_audit'::text AS "ObjectType",
  risk_uncontrolled_internal_audit_result_audit."ModifiedByUser" AS "Id",
  risk_uncontrolled_internal_audit_result_audit."Action",
  risk_uncontrolled_internal_audit_result_audit."ModifiedByUser",
  risk_uncontrolled_internal_audit_result_audit."ModifiedAtTimestamp",
  risk_uncontrolled_internal_audit_result_audit."OrgKey"
FROM risksmart.risk_uncontrolled_internal_audit_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'impact_internal_audit_rating_audit'::text AS "ObjectType",
  impact_internal_audit_rating_audit."ModifiedByUser" AS "Id",
  impact_internal_audit_rating_audit."Action",
  impact_internal_audit_rating_audit."ModifiedByUser",
  impact_internal_audit_rating_audit."ModifiedAtTimestamp",
  impact_internal_audit_rating_audit."OrgKey"
FROM risksmart.impact_internal_audit_rating_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_controlled_second_line_result_audit'::text AS "ObjectType",
  risk_controlled_second_line_result_audit."ModifiedByUser" AS "Id",
  risk_controlled_second_line_result_audit."Action",
  risk_controlled_second_line_result_audit."ModifiedByUser",
  risk_controlled_second_line_result_audit."ModifiedAtTimestamp",
  risk_controlled_second_line_result_audit."OrgKey"
FROM risksmart.risk_controlled_second_line_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'obligation_second_line_result_audit'::text AS "ObjectType",
  obligation_second_line_result_audit."ModifiedByUser" AS "Id",
  obligation_second_line_result_audit."Action",
  obligation_second_line_result_audit."ModifiedByUser",
  obligation_second_line_result_audit."ModifiedAtTimestamp",
  obligation_second_line_result_audit."OrgKey"
FROM risksmart.obligation_second_line_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'obligation_internal_audit_result_audit'::text AS "ObjectType",
  obligation_internal_audit_result_audit."ModifiedByUser" AS "Id",
  obligation_internal_audit_result_audit."Action",
  obligation_internal_audit_result_audit."ModifiedByUser",
  obligation_internal_audit_result_audit."ModifiedAtTimestamp",
  obligation_internal_audit_result_audit."OrgKey"
FROM risksmart.obligation_internal_audit_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'control_test_second_line_result_audit'::text AS "ObjectType",
  control_test_second_line_result_audit."ModifiedByUser" AS "Id",
  control_test_second_line_result_audit."Action",
  control_test_second_line_result_audit."ModifiedByUser",
  control_test_second_line_result_audit."ModifiedAtTimestamp",
  control_test_second_line_result_audit."OrgKey"
FROM risksmart.control_test_second_line_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'document_internal_audit_result_audit'::text AS "ObjectType",
  document_internal_audit_result_audit."ModifiedByUser" AS "Id",
  document_internal_audit_result_audit."Action",
  document_internal_audit_result_audit."ModifiedByUser",
  document_internal_audit_result_audit."ModifiedAtTimestamp",
  document_internal_audit_result_audit."OrgKey"
FROM risksmart.document_internal_audit_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'document_second_line_result_audit'::text AS "ObjectType",
  document_second_line_result_audit."ModifiedByUser" AS "Id",
  document_second_line_result_audit."Action",
  document_second_line_result_audit."ModifiedByUser",
  document_second_line_result_audit."ModifiedAtTimestamp",
  document_second_line_result_audit."OrgKey"
FROM risksmart.document_second_line_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_uncontrolled_second_line_result_audit'::text AS "ObjectType",
  risk_uncontrolled_second_line_result_audit."ModifiedByUser" AS "Id",
  risk_uncontrolled_second_line_result_audit."Action",
  risk_uncontrolled_second_line_result_audit."ModifiedByUser",
  risk_uncontrolled_second_line_result_audit."ModifiedAtTimestamp",
  risk_uncontrolled_second_line_result_audit."OrgKey"
FROM risksmart.risk_uncontrolled_second_line_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_controlled_internal_audit_result_audit'::text AS "ObjectType",
  risk_controlled_internal_audit_result_audit."ModifiedByUser" AS "Id",
  risk_controlled_internal_audit_result_audit."Action",
  risk_controlled_internal_audit_result_audit."ModifiedByUser",
  risk_controlled_internal_audit_result_audit."ModifiedAtTimestamp",
  risk_controlled_internal_audit_result_audit."OrgKey"
FROM risksmart.risk_controlled_internal_audit_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'second_line_result_parent_audit'::text AS "ObjectType",
  second_line_result_parent_audit."Id"::text AS "Id",
  second_line_result_parent_audit."Action",
  second_line_result_parent_audit."ModifiedByUser",
  second_line_result_parent_audit."ModifiedAtTimestamp",
  second_line_result_parent_audit."OrgKey"
FROM risksmart.second_line_result_parent_audit
UNION ALL
SELECT NULL::text AS "Item",
  'control_test_internal_audit_result_audit'::text AS "ObjectType",
  control_test_internal_audit_result_audit."ModifiedByUser" AS "Id",
  control_test_internal_audit_result_audit."Action",
  control_test_internal_audit_result_audit."ModifiedByUser",
  control_test_internal_audit_result_audit."ModifiedAtTimestamp",
  control_test_internal_audit_result_audit."OrgKey"
FROM risksmart.control_test_internal_audit_result_audit
UNION ALL
SELECT NULL::text AS "Item",
  'internal_audit_result_parent_audit'::text AS "ObjectType",
  internal_audit_result_parent_audit."Id"::text AS "Id",
  internal_audit_result_parent_audit."Action",
  internal_audit_result_parent_audit."ModifiedByUser",
  internal_audit_result_parent_audit."ModifiedAtTimestamp",
  internal_audit_result_parent_audit."OrgKey"
FROM risksmart.internal_audit_result_parent_audit
UNION ALL
SELECT NULL::text AS "Item",
  'data_export_schedule'::text AS "ObjectType",
  data_export_schedule_audit."Id"::text AS "Id",
  data_export_schedule_audit."Action",
  data_export_schedule_audit."ModifiedByUser",
  data_export_schedule_audit."ModifiedAtTimestamp",
  data_export_schedule_audit."OrgKey"
FROM risksmart.data_export_schedule_audit
UNION ALL
SELECT NULL::text AS "Item",
  'colour_palette'::text AS "ObjectType",
  colour_palette_audit."Id"::text AS "Id",
  colour_palette_audit."Action",
  colour_palette_audit."ModifiedByUser",
  colour_palette_audit."ModifiedAtTimestamp",
  colour_palette_audit."OrgKey"
FROM risksmart.colour_palette_audit
UNION ALL
SELECT NULL::text AS "Item",
  'custom_role'::text AS "ObjectType",
  custom_role_audit."Id"::text AS "Id",
  custom_role_audit."Action",
  custom_role_audit."ModifiedByUser",
  custom_role_audit."ModifiedAtTimestamp",
  custom_role_audit."OrgKey"
FROM risksmart.custom_role_audit
UNION ALL
SELECT NULL::text AS "Item",
  'custom_role_assignment'::text AS "ObjectType",
  custom_role_assignment_audit."Id"::text AS "Id",
  custom_role_assignment_audit."Action",
  custom_role_assignment_audit."ModifiedByUser",
  custom_role_assignment_audit."ModifiedAtTimestamp",
  custom_role_assignment_audit."OrgKey"
FROM risksmart.custom_role_assignment_audit
UNION ALL
SELECT NULL::text AS "Item",
  'custom_role_user'::text AS "ObjectType",
  custom_role_user_audit."Id"::text AS "Id",
  custom_role_user_audit."Action",
  custom_role_user_audit."ModifiedByUser",
  custom_role_user_audit."ModifiedAtTimestamp",
  custom_role_user_audit."OrgKey"
FROM risksmart.custom_role_user_audit
UNION ALL
SELECT NULL::text AS "Item",
  'attestation_cycle'::text AS "ObjectType",
  attestation_cycle_audit."Id"::text AS "Id",
  attestation_cycle_audit."Action",
  attestation_cycle_audit."ModifiedByUser",
  attestation_cycle_audit."ModifiedAtTimestamp",
  attestation_cycle_audit."OrgKey"
FROM risksmart.attestation_cycle_audit
UNION ALL
SELECT NULL::text AS "Item",
  'third_party_contact'::text AS "ObjectType",
  third_party_contact_audit."Id"::text AS "Id",
  third_party_contact_audit."Action",
  third_party_contact_audit."ModifiedByUser",
  third_party_contact_audit."ModifiedAtTimestamp",
  third_party_contact_audit."OrgKey"
FROM risksmart.third_party_contact_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_assessment_result_impact'::text AS "ObjectType",
  risk_assessment_result_impact_audit."Id"::text AS "Id",
  risk_assessment_result_impact_audit."Action",
  risk_assessment_result_impact_audit."ModifiedByUser",
  risk_assessment_result_impact_audit."ModifiedAtTimestamp",
  risk_assessment_result_impact_audit."OrgKey"
FROM risksmart.risk_assessment_result_impact_audit
UNION ALL
SELECT NULL::text AS "Item",
  'risk_assessment_result_config'::text AS "ObjectType",
  risk_assessment_result_config_audit."Id"::text AS "Id",
  risk_assessment_result_config_audit."Action",
  risk_assessment_result_config_audit."ModifiedByUser",
  risk_assessment_result_config_audit."ModifiedAtTimestamp",
  risk_assessment_result_config_audit."OrgKey"
FROM risksmart.risk_assessment_result_config_audit
UNION ALL
SELECT NULL::text AS "Item",
  'ingestion_config'::text AS "ObjectType",
  ingestion_config_audit."Id"::text AS "Id",
  ingestion_config_audit."Action",
  ingestion_config_audit."ModifiedByUser",
  ingestion_config_audit."ModifiedAtTimestamp",
  ingestion_config_audit."OrgKey"
FROM risksmart.ingestion_config_audit
UNION ALL
SELECT NULL::text AS "Item",
  'sso_configuration'::text AS "ObjectType",
  sso_configuration_audit."Id"::text AS "Id",
  sso_configuration_audit."Action",
  sso_configuration_audit."ModifiedByUser",
  sso_configuration_audit."ModifiedAtTimestamp",
  sso_configuration_audit."OrgKey"
FROM risksmart.sso_configuration_audit;

ALTER VIEW risksmart.audit_log_view
SET (security_invoker = true);

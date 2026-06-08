CREATE TABLE IF NOT EXISTS risksmart.data_export_schedule (
  "Id" uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
  "OrgKey" text NOT NULL,
  "Frequency" text NOT NULL,
  "StartTimestamp" timestamp with time zone NOT NULL,
  "EndTimestamp" timestamp with time zone,
  "StorageType" text NOT NULL,
  "SecretArn" text NOT NULL,
  "CronArn" text,
  "Status" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone default statement_timestamp() NOT NULL
);

ALTER TABLE risksmart.data_export_schedule
ADD CONSTRAINT "data_export_schedule_ModifiedByUser_fkey" FOREIGN KEY ("ModifiedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.data_export_schedule
  ADD CONSTRAINT "data_export_schedule_CreatedByUser_fkey" FOREIGN KEY ("CreatedByUser") REFERENCES auth.user("Id");

ALTER TABLE risksmart.data_export_schedule
  ADD CONSTRAINT "data_export_schedule_OrgKey_fkey" FOREIGN KEY ("OrgKey") REFERENCES auth.organisation("OrgKey");

ALTER TABLE risksmart.data_export_schedule ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS risksmart.data_export_schedule_frequency (
  "Value" text NOT NULL PRIMARY KEY,
  "Comment" text
);

CREATE TABLE IF NOT EXISTS risksmart.data_export_schedule_storage_type (
  "Value" text NOT NULL PRIMARY KEY,
  "Comment" text
);

CREATE TABLE IF NOT EXISTS risksmart.data_export_schedule_status (
  "Value" text NOT NULL PRIMARY KEY,
  "Comment" text
);

ALTER TABLE risksmart.data_export_schedule
ADD CONSTRAINT "data_export_schedule_frequency_fkey" FOREIGN KEY ("Frequency") REFERENCES risksmart.data_export_schedule_frequency("Value");

ALTER TABLE risksmart.data_export_schedule
ADD CONSTRAINT "data_export_schedule_storage_type_fkey" FOREIGN KEY ("StorageType") REFERENCES risksmart.data_export_schedule_storage_type("Value");

ALTER TABLE risksmart.data_export_schedule
ADD CONSTRAINT "data_export_schedule_status_fkey" FOREIGN KEY ("Status") REFERENCES risksmart.data_export_schedule_status("Value");

INSERT INTO risksmart.data_export_schedule_frequency ("Value", "Comment")
VALUES ('daily', 'Daily'),
       ('weekly', 'Weekly'),
       ('monthly', 'Monthly');

INSERT INTO risksmart.data_export_schedule_storage_type ("Value", "Comment")
VALUES ('azureBlobStorage', 'AzureBlobStorage'),
       ('amazonS3', 'AmazonS3'),
       ('sftp', 'SFTP'),
       ('msSharePoint', 'MsSharePoint');

INSERT INTO risksmart.data_export_schedule_status ("Value", "Comment")
VALUES ('active', 'Active'),
       ('inactive', 'Inactive');

CREATE TABLE IF NOT EXISTS risksmart.data_export_schedule_audit (
  "Id" uuid NOT NULL,
  "OrgKey" text NOT NULL,
  "Frequency" text NOT NULL,
  "StartTimestamp" timestamp with time zone NOT NULL,
  "EndTimestamp" timestamp with time zone,
  "StorageType" text NOT NULL,
  "SecretArn" text NOT NULL,
  "CronArn" text,
  "Status" text NOT NULL,
  "CreatedByUser" text NOT NULL,
  "ModifiedByUser" text NOT NULL,
  "CreatedAtTimestamp" timestamp with time zone NOT NULL,
  "ModifiedAtTimestamp" timestamp with time zone NOT NULL,
  "Action" risksmart.db_action,
  PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

ALTER TABLE risksmart.data_export_schedule_audit ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION risksmart.data_export_schedule_modified() RETURNS trigger AS $body$
DECLARE nr RECORD;

DECLARE updated_user TEXT;

DECLARE update_timestamp timestamp with time zone;

BEGIN if (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) then nr := NEW;

updated_user := NEW."ModifiedByUser";

update_timestamp := NEW."ModifiedAtTimestamp";

elsif (TG_OP = 'DELETE') then nr := OLD;

updated_user := risksmart.get_hasura_user_id();

update_timestamp := statement_timestamp();

END IF;

insert into risksmart.data_export_schedule_audit(
        "Id",
        "OrgKey",
        "Frequency",
        "StartTimestamp",
        "EndTimestamp",
        "StorageType",
        "SecretArn",
        "CronArn",
        "Status",
        "CreatedByUser",
        "ModifiedByUser",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "Action"
    )
values (
        nr."Id",
        nr."OrgKey",
        nr."Frequency",
        nr."StartTimestamp",
        nr."EndTimestamp",
        nr."StorageType",
        nr."SecretArn",
        nr."CronArn",
        nr."Status",
        nr."CreatedByUser",
        updated_user,
        nr."CreatedAtTimestamp",
        update_timestamp,
        TG_OP
    );

RETURN nr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER data_export_schedule_audit_trigger
AFTER
INSERT
    OR DELETE
    OR UPDATE
ON risksmart.data_export_schedule
FOR EACH ROW EXECUTE FUNCTION risksmart.data_export_schedule_modified();

-- Update audit log view to include data export schedule
CREATE OR REPLACE VIEW risksmart.audit_log_view AS
select null as "Item",
       'tag' as "ObjectType",
       "TagTypeId"::text as "Id",
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.tag_audit
union all
select null,
       'department',
       "DepartmentTypeId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.department_audit
union all
select "FileName",
       'file',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.file_audit
union all
select null,
       'relation_file',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.relation_file_audit
union all
select null,
       'control_action',
       "ControlId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.control_action_audit
union all
select null,
       'risk_action',
       "RiskId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.risk_action_audit
union all
select null,
       'issue_action',
       "IssueId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_action_audit
union all
select null,
       'obligation_action',
       "ObligationId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.obligation_action_audit
union all
select null,
       'obligation_issue',
       "ObligationId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.obligation_issue_audit
union all
select null,
       'document_linked_document',
       "DocumentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_linked_document_audit
union all
select null,
       'document_action',
       "DocumentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_action_audit
union all
select null,
       'document_issue',
       "DocumentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_issue_audit
union all
select null,
       'custom_attribute_schema',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.custom_attribute_schema_audit
union all
select "Title",
       'acceptance',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.acceptance_audit
union all
select null,
       'comment',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.comment_audit
union all
select null,
       'obligation_impact',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.obligation_impact_audit
union all
select null,
       'appetite',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.appetite_audit
union all
select "Title",
       'issue',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue'
union all
select "Title",
       'issue_breach_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_breach_log'
union all
select "Title",
       'issue_sar_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_sar_log'
union all
select "Title",
       'issue_gdpr_breach_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_gdpr_breach_log'
union all
select "Title",
       'issue_pci_breach_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_pci_breach_log'
union all
select "Title",
       'issue_consumer_duty',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_consumer_duty'
union all
select "Title",
       'issue_customer_trust',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_customer_trust'
union all
select "Title",
       'issue_risk_event',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_audit
WHERE "Type" = 'issue_risk_event'
union all
select "Title",
       'action_update',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.action_update_audit
union all
select null,
       'control_group',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.control_group_audit
union all
select null,
       'indicator_result',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.indicator_result_audit
union all
select "Title",
       'issue_update',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_update_audit
union all
select null,
       'issue_assessment',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment'
union all
select null,
       'issue_assessment_breach_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_breach_log'
union all
select null,
       'issue_assessment_sar_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_sar_log'
union all
select null,
       'issue_assessment_gdpr_breach_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_gdpr_breach_log'
union all
select null,
       'issue_assessment_pci_breach_log',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_pci_breach_log'
union all
select null,
       'issue_assessment_consumer_duty',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_consumer_duty'
union all
select null,
       'issue_assessment_customer_trust',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_customer_trust'
union all
select null,
       'issue_assessment_risk_event',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_assessment_audit
WHERE "Type" = 'issue_assessment_risk_event'
union all
select "Title",
       'cause',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.cause_audit
union all
select "Title",
       'test_result',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.test_result_audit
union all
select null,
       'taxonomy',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       null as "OrgKey"
/* TODO: investigate why OrgKey is missing on this table */
from risksmart.taxonomy_audit
union all
select null,
       'taxonomy_org',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.taxonomy_org_audit
union all
select null,
       'contributor',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.contributor_audit
union all
select null,
       'owner',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.owner_audit
union all
select null,
       'approval',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.approval_audit
union all
select null,
       'approval_level',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.approval_level_audit
union all
select null,
       'approver',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.approver_audit
union all
select null,
       'action_parent',
       "ActionId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.action_parent_audit
union all
select null,
       'control_parent',
       "ControlId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.control_parent_audit
union all
select "ParentType",
       'form_configuration',
       null::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.form_configuration_audit
union all
select null,
       'indicator_parent',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.indicator_parent_audit
union all
select "Title",
       'action',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.action_audit
union all
select "Title",
       'risk',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.risk_audit
union all
select "Title",
       'control',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.control_audit
union all
select "Title",
       'document',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_audit
union all
select null,
       'form_field_configuration',
       null::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.form_field_configuration_audit
union all
select "Title",
       'obligation',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.obligation_audit
union all
select null,
       'issue_parent',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.issue_parent_audit
union all
select null,
       'owner_group',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.owner_group_audit
union all
select null,
       'contributor_group',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.contributor_group_audit
union all
select null,
       'user_group_users',
       "UserGroupId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.user_group_user_audit
union all
select null,
       'conversation',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.conversation_audit
union all
select "Title",
       'consequence',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.consequence_audit
union all
select "Title",
       'assessment',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.assessment_audit
union all
select "Name",
       'impact',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.impact_audit
union all
select null,
       'obligation_assessment_result',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.obligation_assessment_result_audit
union all
select "Name",
       'tag_type_group',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.tag_type_group_audit
union all
select "Name",
       'tag_type',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.tag_type_audit
union all
select null,
       'impact_rating',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.impact_rating_audit
union all
select "Title",
       'indicator_audit',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.indicator_audit
union all
select "Name",
       'department_type_group',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.department_type_group_audit
union all
select null,
       'risk_assessment_result',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.risk_assessment_result_audit
union all
select null,
       'document_assessment_result',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_assessment_result_audit
union all
select "Name",
       'department_type',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.department_type_audit
union all
select null,
       'risk_assessment',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.old_risk_assessment_audit
union all
select null,
       'document_assessment',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.old_document_assessment_audit
union all
select null,
       'obligation_assessment',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.old_obligation_assessment_audit
union all
select "Name",
       'user_group',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.user_group_audit
union all
select "Version",
       'document_file',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_file_audit
union all
select null,
       'linked_item',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.linked_item_audit
union all
select null,
       'acceptance_parent',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.acceptance_parent_audit
union all
select null,
       'assessment_result_parent',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.assessment_result_parent_audit
union all
select null,
       'change_request_contributor',
       "Id"::text,
        "Action",
       null as "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
/* TODO: Investigate why this table doesn't have a"ModifiedByUser */
from risksmart.change_request_contributor_audit
union all
select null,
       'appetite_parent',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.appetite_parent_audit
union all
select null,
       'impact_parent',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.impact_parent_audit
union all
select "Title",
       'assessment_activity',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.assessment_activity_audit
union all
select null,
       'change_request',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.change_request_audit
union all
select "Title",
       'internal_audit_report',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.internal_audit_report_audit
union all
select null,
       'user_search_preferences',
       null::text,
    /* TODO: do we want user actions in audit log? */
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.user_search_preferences_audit
union all
select null,
       'custom_ribbon',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.custom_ribbon_audit
union all
select "Title",
       'compliance_monitoring_assessment',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.compliance_monitoring_assessment_audit
union all
select "Title",
       'business_area',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.business_area_audit
union all
select "Title",
       'internal_audit_entity',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.internal_audit_entity_audit
union all
select "Name",
       'dashboard',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.dashboard_audit
union all
select null,
       'approver_response',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       null as "OrgKey"
       /* TODO: Investigate why this table doesn't have a OrgKey */
from risksmart.approver_response_audit
union all
select null,
       'attestation_group',
       "GroupId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.attestation_group_audit
union all
select null,
       'attestation_record',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.attestation_record_audit
union all
select null,
       'attestation_config',
       "ParentId"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.attestation_config_audit
union all
select "Title",
       'third_party',
       "Id"::text,
        "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.third_party_audit
union all
select 'Authentication',
       'user_activity',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from auth.user_activity_audit
union all
select "Title",
       'enterprise_risk',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.enterprise_risk_audit
union ALL
select null,
       'enterprise_risk_instance',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.enterprise_risk_instance_audit
union ALL
select null,
       'schedule',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.schedule_audit
union ALL
select "Title",
       'questionnaire_template',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.questionnaire_template_audit
union ALL
select null,
       'questionnaire_invite',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.questionnaire_invite_audit
union all
select null,
       'questionnaire_template_version',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.questionnaire_template_version_audit
union all
select null,
       'third_party_response',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.third_party_response_audit
union all
select null,
       'entity',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.entity_audit
union all
select null,
       'wizard',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.wizard_audit
union all
select null,
       'custom_datasource',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.custom_datasource_audit
union all
select null,
       'impact_second_line_rating_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.impact_second_line_rating_audit
union all
select null,
       'risk_uncontrolled_internal_audit_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.risk_uncontrolled_internal_audit_result_audit
union all
select null,
       'impact_internal_audit_rating_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.impact_internal_audit_rating_audit
union all
select null,
       'risk_controlled_second_line_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.risk_controlled_second_line_result_audit
union all
select null,
       'obligation_second_line_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.obligation_second_line_result_audit
union all
select null,
       'obligation_internal_audit_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.obligation_internal_audit_result_audit
union all
select null,
       'control_test_second_line_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.control_test_second_line_result_audit
union all
select null,
       'document_internal_audit_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_internal_audit_result_audit
union all
select null,
       'document_second_line_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.document_second_line_result_audit
union all
select null,
       'risk_uncontrolled_second_line_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.risk_uncontrolled_second_line_result_audit
union all
select null,
       'risk_controlled_internal_audit_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.risk_controlled_internal_audit_result_audit
union all
select null,
       'second_line_result_parent_audit',
       "Id"::text,
  "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.second_line_result_parent_audit
union all
select null,
       'control_test_internal_audit_result_audit',
       "ModifiedByUser",
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.control_test_internal_audit_result_audit
union all
select null,
       'internal_audit_result_parent_audit',
       "Id"::text,
  "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.internal_audit_result_parent_audit
union all
select null,
       'data_export_schedule',
       "Id"::text,
       "Action",
       "ModifiedByUser",
       "ModifiedAtTimestamp",
       "OrgKey"
from risksmart.data_export_schedule_audit;

ALTER VIEW risksmart.audit_log_view
SET (security_invoker = true);

CREATE POLICY own_org ON risksmart.data_export_schedule_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.data_export_schedule TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.data_export_schedule TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.data_export_schedule_audit TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

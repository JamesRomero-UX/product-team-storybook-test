CREATE TABLE IF NOT EXISTS risksmart.custom_datasource (
    "Id" UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    "Title" TEXT NOT NULL,
    "Datasources" JSONB NOT NULL,
    "Fields" JSONB,
    "Filters" JSONB,
    "OrgKey" TEXT NOT NULL REFERENCES auth."organisation"("OrgKey"),
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE DEFAULT statement_timestamp() NOT NULL,
    "CreatedByUser" TEXT NOT NULL REFERENCES auth."user"("Id"),
    "ModifiedByUser" TEXT NOT NULL REFERENCES auth."user"("Id")
);

CREATE TABLE IF NOT EXISTS risksmart.custom_datasource_audit (
    "Id" UUID NOT NULL,
    "Title" TEXT NOT NULL,
    "Datasources" JSONB NOT NULL,
    "Fields" JSONB,
    "Filters" JSONB,
    "OrgKey" TEXT NOT NULL,
    "CreatedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "ModifiedAtTimestamp" TIMESTAMP WITH TIME ZONE NOT NULL,
    "CreatedByUser" TEXT NOT NULL,
    "ModifiedByUser" TEXT NOT NULL,
    "Action" risksmart.db_action NOT NULL,
    PRIMARY KEY ("Id", "ModifiedAtTimestamp")
);

CREATE OR REPLACE FUNCTION risksmart.custom_datasource_modified() RETURNS TRIGGER AS $body$
DECLARE anr RECORD;

DECLARE a_updated_user TEXT;

DECLARE a_update_timestamp TIMESTAMP WITH TIME ZONE;

BEGIN IF (
    TG_OP = 'UPDATE'
    OR TG_OP = 'INSERT'
) THEN anr := NEW;

a_updated_user := NEW."ModifiedByUser";

a_update_timestamp := NEW."ModifiedAtTimestamp";

ELSIF (TG_OP = 'DELETE') THEN anr := OLD;

a_updated_user := risksmart.get_hasura_user_id();

a_update_timestamp := STATEMENT_TIMESTAMP();

END IF;

INSERT INTO risksmart.custom_datasource_audit(
        "Id",
        "Title",
        "Datasources",
        "Fields",
        "Filters",
        "OrgKey",
        "CreatedAtTimestamp",
        "ModifiedAtTimestamp",
        "CreatedByUser",
        "ModifiedByUser",
        "Action"
    )
VALUES (
        anr."Id",
        anr."Title",
        anr."Datasources",
        anr."Fields",
        anr."Filters",
        anr."OrgKey",
        anr."CreatedAtTimestamp",
        a_update_timestamp,
        anr."CreatedByUser",
        a_updated_user,
        TG_OP
    );

RETURN anr;

END;

$body$ LANGUAGE plpgsql;

CREATE TRIGGER custom_datasource_audit_trigger
AFTER
INSERT
    OR
UPDATE
    OR DELETE ON risksmart.custom_datasource FOR EACH ROW EXECUTE PROCEDURE risksmart.custom_datasource_modified();

ALTER TABLE risksmart.custom_datasource_audit ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.custom_datasource ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.custom_datasource TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.custom_datasource_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

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
    "TagTypeId"::text,
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
    "DepartmentTypeId"::text,
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
from risksmart.custom_datasource_audit;

ALTER VIEW risksmart.audit_log_view
SET (security_invoker = true);
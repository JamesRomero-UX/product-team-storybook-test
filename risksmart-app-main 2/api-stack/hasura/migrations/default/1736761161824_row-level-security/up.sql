CREATE ROLE reporting LOGIN;

GRANT USAGE ON SCHEMA risksmart TO reporting;

GRANT pg_read_all_data TO reporting;

ALTER TABLE risksmart.risk ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."conversation_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."impact_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."control_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."owner_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."tag_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."questionnaire_template_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."risk_score_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."relation_file" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."consequence_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."cause_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."indicator_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."change_request" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."impact" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."acceptance" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."questionnaire_template" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_assessment_result_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_assessment_result" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."risk_score" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."third_party_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_search_preferences_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."control_group_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approver_response" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."questionnaire_invite_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."appetite_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."assessment_activity_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."control_action_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."indicator" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."internal_audit_report" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_search_preferences" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."linked_item_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."owner_group" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."attestation_group_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."impact_rating" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation_assessment_result_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."form_field_configuration_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."indicator_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."tag_type_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."aggregation_org" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."conversation" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."department_type_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."custom_ribbon" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_issue_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."old_risk_assessment_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."custom_attribute_schema" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."aggregation_org_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approver" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."impact_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approver_response_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."department_type" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_group_user_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."schedule_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."schedule_state" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."risk_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."attestation_config_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."appetite_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."department_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."owner_group_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."cause" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."tag_type" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."schedule_state_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation_assessment_result" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."action_update" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."department" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."acceptance_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."dashboard_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_file_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."consequence" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."contributor_group_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."data_import_error" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approval_level_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."internal_audit_report_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."department_type_group" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."form_configuration_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."dashboard" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."third_party_response_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."internal_audit_entity" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."risk_assessment_result" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."data_import_error_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."contributor_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."comment_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_update" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."linked_item" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."internal_audit_entity_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."data_import_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."acceptance_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."form_configuration" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_action_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."action_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."risk_action_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_table_preferences" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."tag_type_group" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."compliance_monitoring_assessment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."schedule" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."business_area" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation_issue_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."action_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."attestation_record" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation_action_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."impact_rating_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."control_group" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_update_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."contributor" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."contributor_group" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approver_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."form_field_configuration" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."business_area_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."indicator_result" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."questionnaire_template_version" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."indicator_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."assessment_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approval_level" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."compliance_monitoring_assessment_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."tag_type_group_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."file_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."appetite" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."action_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation_impact_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."custom_attribute_schema_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."assessment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation_impact" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."acceptance_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."relation_file_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."change_request_contributor_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."custom_ribbon_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_action_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."control_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_table_preferences_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."attestation_config" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_group_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."old_risk_assessment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."questionnaire_template_version_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."tag" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."action_update_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."change_request_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_assessment_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."control_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."test_result" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approval" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."attestation_record_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."form_field_ordering_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."assessment_activity" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."impact_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."questionnaire_invite" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."issue_assessment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."department_type_group_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_group_user" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."obligation" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."third_party_response" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."old_document_assessment_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."comment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_linked_document_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."indicator_result_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_linked_document" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."test_result_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."document_file" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."approval_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."file" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."old_document_assessment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."change_request_contributor" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."assessment_result_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."assessment_result_parent" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."owner" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."user_group" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."third_party" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."data_import" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."appetite_parent_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."old_obligation_assessment_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."old_obligation_assessment" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."attestation_group" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."form_field_ordering" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."risk_assessment_result_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "risksmart"."action" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "auth"."organisation_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "auth"."organisationuser_audit" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "auth"."organisation" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "auth"."organisationuser" ENABLE ROW LEVEL SECURITY;

ALTER TABLE risksmart.control ENABLE ROW LEVEL SECURITY;

CREATE POLICY own_org ON risksmart.risk TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.conversation_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.owner_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.tag_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.questionnaire_template_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_score_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.relation_file TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.consequence_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.cause_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.indicator_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.change_request TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.acceptance TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.questionnaire_template TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_assessment_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_assessment_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_score TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.third_party_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_search_preferences_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_group_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approver_response TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.questionnaire_invite_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.appetite_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.assessment_activity_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_action_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.indicator TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.internal_audit_report TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_search_preferences TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.linked_item_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.owner_group TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.attestation_group_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact_rating TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_assessment_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.form_field_configuration_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.indicator_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.tag_type_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.aggregation_org TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.conversation TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.department_type_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.custom_ribbon TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_issue_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.old_risk_assessment_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.custom_attribute_schema TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.aggregation_org_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approver TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approver_response_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.department_type TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_group_user_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.schedule_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.schedule_state TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.attestation_config_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.appetite_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.department_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.owner_group_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.cause TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.tag_type TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.schedule_state_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_assessment_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.action_update TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.department TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.acceptance_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.dashboard_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_file_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.consequence TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.contributor_group_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.data_import_error TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approval_level_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.internal_audit_report_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.department_type_group TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.form_configuration_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.dashboard TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.third_party_response_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.internal_audit_entity TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_assessment_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.data_import_error_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.contributor_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.comment_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_update TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.linked_item TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.internal_audit_entity_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.data_import_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.acceptance_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.form_configuration TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_action_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.action_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_action_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_table_preferences TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.tag_type_group TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.compliance_monitoring_assessment TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.schedule TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.business_area TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_issue_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.action_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.attestation_record TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_action_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact_rating_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_group TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_update_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.contributor TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.contributor_group TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approver_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.form_field_configuration TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.business_area_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.indicator_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.questionnaire_template_version TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.indicator_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.assessment_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approval_level TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.compliance_monitoring_assessment_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.tag_type_group_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.file_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.appetite TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.action_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_impact_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.custom_attribute_schema_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.assessment TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation_impact TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.acceptance_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.relation_file_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.change_request_contributor_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.custom_ribbon_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_action_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_table_preferences_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.attestation_config TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_group_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.old_risk_assessment TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.questionnaire_template_version_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.tag TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.action_update_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.change_request_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_assessment_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.control_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.test_result TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approval TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.attestation_record_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.form_field_ordering_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.assessment_activity TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.impact_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.questionnaire_invite TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.issue_assessment TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.department_type_group_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_group_user TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.obligation TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.third_party_response TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.old_document_assessment_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.comment TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_linked_document_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.indicator_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_linked_document TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.test_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.document_file TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.approval_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.file TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.old_document_assessment TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.change_request_contributor TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.assessment_result_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.assessment_result_parent TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.owner TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.user_group TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.third_party TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.data_import TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.appetite_parent_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.old_obligation_assessment_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.old_obligation_assessment TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.attestation_group TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.form_field_ordering TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.risk_assessment_result_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON risksmart.action TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.organisation_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.organisationuser_audit TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.organisation TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org ON auth.organisationuser TO reporting USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
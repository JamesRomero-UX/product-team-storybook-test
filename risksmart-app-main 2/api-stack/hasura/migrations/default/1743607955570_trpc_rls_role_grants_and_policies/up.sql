-- grant usage for risksmart schema
GRANT USAGE ON SCHEMA risksmart TO trpc;

GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON ALL TABLES IN SCHEMA risksmart TO trpc;

ALTER DEFAULT PRIVILEGES IN SCHEMA risksmart
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON TABLES TO trpc;

-- grant usage for auth schema
GRANT USAGE ON SCHEMA auth TO trpc;

GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON ALL TABLES IN SCHEMA auth TO trpc;

ALTER DEFAULT PRIVILEGES IN SCHEMA auth
GRANT SELECT,
    INSERT,
    UPDATE,
    DELETE ON TABLES TO trpc;

-- create policies for trpc role
CREATE POLICY own_org_rw ON risksmart.risk FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.conversation_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.owner_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.tag_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.questionnaire_template_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_score_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.relation_file FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.consequence_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.cause_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.indicator_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.change_request FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.acceptance FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.questionnaire_template FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_assessment_result_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_assessment_result FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_score FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.third_party_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_search_preferences_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_group_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approver_response FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.questionnaire_invite_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.appetite_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.assessment_activity_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_action_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.indicator FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.internal_audit_report FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_search_preferences FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.linked_item_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.owner_group FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.attestation_group_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_rating FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_assessment_result_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.form_field_configuration_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.indicator_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.tag_type_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.aggregation_org FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.conversation FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.department_type_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.custom_ribbon FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_issue_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.old_risk_assessment_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.custom_attribute_schema FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.aggregation_org_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approver FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approver_response_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.department_type FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_group_user_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.schedule_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.schedule_state FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.attestation_config_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.appetite_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.department_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.owner_group_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.cause FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.tag_type FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.schedule_state_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_assessment_result FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.action_update FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.department FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.acceptance_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.dashboard_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_file_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.consequence FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.contributor_group_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.data_import_error FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approval_level_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.internal_audit_report_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.department_type_group FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.form_configuration_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.dashboard FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.third_party_response_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.internal_audit_entity FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_assessment_result FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.data_import_error_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.contributor_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.comment_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_update FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.linked_item FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.internal_audit_entity_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.data_import_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.acceptance_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.form_configuration FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_action_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.action_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_action_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_table_preferences FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.tag_type_group FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.compliance_monitoring_assessment FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.schedule FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.business_area FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_issue_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.action_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.attestation_record FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_action_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_rating_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_group FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_update_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.contributor FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.contributor_group FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approver_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.form_field_configuration FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.business_area_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.indicator_result FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.questionnaire_template_version FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.indicator_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.assessment_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approval_level FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.compliance_monitoring_assessment_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.tag_type_group_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.file_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.appetite FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.action_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_impact_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.custom_attribute_schema_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.assessment FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation_impact FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.acceptance_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.relation_file_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.change_request_contributor_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.custom_ribbon_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_action_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_table_preferences_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.attestation_config FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_group_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.old_risk_assessment FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.questionnaire_template_version_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.tag FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.action_update_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.change_request_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_assessment_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.control_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.test_result FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approval FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.attestation_record_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.form_field_ordering_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.assessment_activity FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.impact_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.questionnaire_invite FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.issue_assessment FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.department_type_group_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_group_user FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.obligation FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.third_party_response FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.old_document_assessment_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.comment FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_linked_document_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.indicator_result_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_linked_document FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.test_result_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.document_file FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.approval_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.file FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.old_document_assessment FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.change_request_contributor FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.assessment_result_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.assessment_result_parent FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.owner FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.user_group FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.third_party FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.data_import FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.appetite_parent_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.old_obligation_assessment_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.old_obligation_assessment FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.attestation_group FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.form_field_ordering FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_assessment_result_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.action FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.organisation_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.organisationuser_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.organisation FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON auth.organisationuser FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.enterprise_risk_instance FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.enterprise_risk_instance_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.enterprise_risk_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.enterprise_risk FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.entity FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.entity_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.enterprise_risk_score FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.enterprise_risk_score_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.wizard_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.wizard FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.custom_datasource FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.custom_datasource_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_rating_definition FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);

CREATE POLICY own_org_rw ON risksmart.risk_rating_definition_audit FOR ALL TO trpc USING (
    "OrgKey" = current_setting('risksmart.org_key', 't')
) WITH CHECK (
    "OrgKey" = current_setting('risksmart.org_key', 't')
);
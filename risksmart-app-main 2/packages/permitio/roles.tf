resource "permitio_role" "contributor_group__Member" {
  key      = "Member"
  name     = "Member"
  resource = permitio_resource.contributor_group.key
  permissions = [
    "delete",
    "insert",
    "read",
    "update"
  ]

  depends_on = [permitio_resource.contributor_group]
}
resource "permitio_role" "owner_group__Member" {
  key      = "Member"
  name     = "Member"
  resource = permitio_resource.owner_group.key
  permissions = [
    "read",
    "delete",
    "update",
    "insert"
  ]

  depends_on = [permitio_resource.owner_group]
}
resource "permitio_role" "Owner" {
  key      = "Owner"
  name     = "Owner"
  resource = permitio_resource.rs_node.key
  permissions = ["update",
    "read",
    "insert",
    "delete"
  ]

  depends_on = [permitio_resource.rs_node]
}
resource "permitio_role" "Contributor" {
  key      = "Contributor"
  name     = "Contributor"
  resource = permitio_resource.rs_node.key
  permissions = [
    "update",
    "read"
  ]

  depends_on = [permitio_resource.rs_node]
}
resource "permitio_role" "Reader" {
  key         = "Reader"
  name        = "Reader"
  resource    = permitio_resource.rs_node.key
  permissions = ["read"]

  depends_on = [permitio_resource.rs_node]
}
resource "permitio_role" "member" {
  key      = "member"
  name     = "member"
  resource = permitio_resource.user_group.key
  permissions = [
    "insert",
    "delete",
    "read",
    "update"
  ]

  depends_on = [permitio_resource.user_group]
}
resource "permitio_role" "RiskManager" {
  key  = "RiskManager"
  name = "RiskManager"
  permissions = [
    "risk:delete",
    "risk:insert",
    "risk:read",
    "risk:update",
    "enterprise_risk:delete",
    "enterprise_risk:insert",
    "enterprise_risk:read",
    "enterprise_risk:update",
    "external_api:delete",
    "external_api:insert",
    "external_api:read",
    "external_api:update",
    "acceptance:delete",
    "acceptance:insert",
    "acceptance:read",
    "acceptance:update",
    "appetite:delete",
    "appetite:insert",
    "appetite:read",
    "appetite:update",
    "impact:read",
    "impact:delete",
    "impact:insert",
    "impact:update",
    "impact_rating:delete",
    "impact_rating:insert",
    "impact_rating:read",
    "impact_rating:update",
    "risk_assessment_result:delete",
    "risk_assessment_result:insert",
    "risk_assessment_result:read",
    "risk_assessment_result:update",
    "risk_tier_1:delete",
    "risk_tier_1:insert",
    "risk_tier_1:read",
    "risk_tier_1:update",
    "risk_form_configuration:update",
    "ingestion_config:read",
    "ingestion_config:insert",
    "ingestion_config:update",
    "ingestion_config:delete"
  ]

  depends_on = [
    permitio_resource.enterprise_risk,
    permitio_resource.risk,
    permitio_resource.acceptance,
    permitio_resource.appetite,
    permitio_resource.impact,
    permitio_resource.impact_rating,
    permitio_resource.risk_assessment_result,
    permitio_resource.risk_tier_1,
    permitio_resource.external_api,
    permitio_resource.risk_form_configuration,
    permitio_resource.ingestion_config
  ]
}

resource "permitio_role" "RiskViewer" {
  key  = "RiskViewer"
  name = "RiskViewer"
  permissions = [
    "risk:read",
    "enterprise_risk:read",
    "acceptance:read",
    "appetite:read",
    "impact:read",
    "risk_assessment_result:read",
    "risk_tier_1:read"
  ]

  depends_on = [
    permitio_resource.enterprise_risk,
    permitio_resource.risk,
    permitio_resource.acceptance,
    permitio_resource.appetite,
    permitio_resource.impact,
    permitio_resource.risk_assessment_result,
    permitio_resource.risk_tier_1
  ]
}
resource "permitio_role" "Standard" {
  key  = "Standard"
  name = "Standard"
  permissions = [
    "acceptance:read",
    "action_update:read",
    "action:read",
    "appetite:read",
    "assessment_activity:read",
    "assessment:read",
    "assessment:insert",
    "attestation_record:read",
    "business_area:read",
    "cause:read",
    "change_request:read",
    "colour_palette:read",
    "consequence:read",
    "contributor_group:read",
    "control_group:read",
    "control:read",
    "conversation:read",
    "custom_ribbon:read",
    "custom_role:read",
    "dashboard:read",
    "department_type:read",
    "document_assessment_result:read",
    "document_file:read",
    "document:read",
    "enterprise_risk:read",
    "entity:read",
    "impact_rating:read",
    "impact:read",
    "indicator_result:read",
    "indicator:read",
    "internal_audit_entity:read",
    "internal_audit_report:read",
    "issue_assessment:read",
    "issue_update:read",
    "issue:read",
    "linked_item:read",
    "my_items:read",
    "notification:read",
    "obligation_assessment_result:read",
    "obligation_impact:read",
    "obligation:read",
    "organisation_dashboard:read",
    "organisation_module:read",
    "owner_group:read",
    "public_issue_form:read",
    "public_policies:read",
    "questionnaire_template_version:read",
    "questionnaire_template:read",
    "risk:read",
    "tag_type:read",
    "test_result:read",
    "third_party_response:read",
    "third_party:read",
    "user_group:read",
  ]

  depends_on = [
    permitio_resource.acceptance,
    permitio_resource.action_update,
    permitio_resource.action,
    permitio_resource.appetite,
    permitio_resource.assessment_activity,
    permitio_resource.assessment,
    permitio_resource.attestation_record,
    permitio_resource.cause,
    permitio_resource.change_request,
    permitio_resource.colour_palette,
    permitio_resource.consequence,
    permitio_resource.contributor_group,
    permitio_resource.control_group,
    permitio_resource.control,
    permitio_resource.conversation,
    permitio_resource.custom_ribbon,
    permitio_resource.custom_role,
    permitio_resource.dashboard,
    permitio_resource.department_type,
    permitio_resource.document_assessment_result,
    permitio_resource.document_file,
    permitio_resource.document,
    permitio_resource.enterprise_risk,
    permitio_resource.entity,
    permitio_resource.impact_rating,
    permitio_resource.impact,
    permitio_resource.indicator_result,
    permitio_resource.indicator,
    permitio_resource.internal_audit_entity,
    permitio_resource.internal_audit_report,
    permitio_resource.issue_assessment,
    permitio_resource.issue_update,
    permitio_resource.issue,
    permitio_resource.linked_item,
    permitio_resource.my_items,
    permitio_resource.notification,
    permitio_resource.obligation_assessment_result,
    permitio_resource.obligation_impact,
    permitio_resource.obligation,
    permitio_resource.obligation_change,
    permitio_resource.obligation_change_attestation,
    permitio_resource.organisation_dashboard,
    permitio_resource.organisation_module,
    permitio_resource.owner_group,
    permitio_resource.public_issue_form,
    permitio_resource.public_policies,
    permitio_resource.questionnaire_template_version,
    permitio_resource.questionnaire_template,
    permitio_resource.risk,
    permitio_resource.tag_type,
    permitio_resource.test_result,
    permitio_resource.third_party_response,
    permitio_resource.third_party,
    permitio_resource.user_group,
  ]
}
resource "permitio_role" "Public" {
  key  = "Public"
  name = "Public"
  permissions = [
    "public_policies:read",
    "public_issue_form:read",
    "organisation_module:read",
  ]

  depends_on = [
    permitio_resource.public_policies,
    permitio_resource.public_issue_form,
    permitio_resource.organisation_module,
  ]
}
resource "permitio_role" "TechnicalSupport" {
  key  = "TechnicalSupport"
  name = "TechnicalSupport"
  permissions = [
    "external_api:delete",
    "external_api:insert",
    "external_api:read",
    "external_api:update",
    "sso_configuration:delete",
    "sso_configuration:insert",
    "sso_configuration:read",
    "sso_configuration:update"
  ]
  depends_on = [
    permitio_resource.external_api,
    permitio_resource.sso_configuration
  ]
}
resource "permitio_role" "InternalAuditManager" {
  key  = "InternalAuditManager"
  name = "InternalAuditManager"
  permissions = [
    "internal_audit_entity:delete",
    "internal_audit_entity:insert",
    "internal_audit_entity:read",
    "internal_audit_entity:update",
    "internal_audit_report:delete",
    "internal_audit_report:insert",
    "internal_audit_report:read",
    "internal_audit_report:update",
    "internal_audit_entity_form_configuration:update",
    "internal_audit_report_form_configuration:update"
  ]
  depends_on = [
    permitio_resource.internal_audit_report,
    permitio_resource.internal_audit_entity,
    permitio_resource.internal_audit_entity_form_configuration,
    permitio_resource.internal_audit_report_form_configuration
  ]
}

resource "permitio_role" "InternalAuditViewer" {
  key  = "InternalAuditViewer"
  name = "InternalAuditViewer"
  permissions = [
    "internal_audit_entity:read",
    "internal_audit_report:read",
  ]
  depends_on = [
    permitio_resource.internal_audit_report,
    permitio_resource.internal_audit_entity,
  ]

}
resource "permitio_role" "ThirdPartyRespondent" {
  key  = "ThirdPartyRespondent"
  name = "ThirdPartyRespondent"
}
resource "permitio_role" "ActionViewer" {
  key  = "ActionViewer"
  name = "ActionViewer"
  permissions = [
    "action:read",
    "action_update:read"
  ]

  depends_on = [
    permitio_resource.action,
    permitio_resource.action_update
  ]
}
resource "permitio_role" "ActionManager" {
  key  = "ActionManager"
  name = "ActionManager"
  permissions = [
    "action:read",
    "action:insert",
    "action:update",
    "action:delete",
    "action_update:read",
    "action_update:insert",
    "action_update:update",
    "action_update:delete",
    "action_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.action,
    permitio_resource.action_update,
    permitio_resource.action_form_configuration
  ]
}
resource "permitio_role" "AssessmentViewer" {
  key  = "AssessmentViewer"
  name = "AssessmentViewer"
  permissions = [
    "assessment:read",
    "assessment_activity:read"
  ]

  depends_on = [
    permitio_resource.assessment,
    permitio_resource.assessment_activity
  ]
}
resource "permitio_role" "AssessmentManager" {
  key  = "AssessmentManager"
  name = "AssessmentManager"
  permissions = [
    "assessment:read",
    "assessment:insert",
    "assessment:update",
    "assessment:delete",
    "assessment_activity:read",
    "assessment_activity:insert",
    "assessment_activity:update",
    "assessment_activity:delete",
    "assessment_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.assessment,
    permitio_resource.assessment_activity,
    permitio_resource.assessment_form_configuration
  ]
}
resource "permitio_role" "ComplianceViewer" {
  key  = "ComplianceViewer"
  name = "ComplianceViewer"
  permissions = [
    "compliance_monitoring_assessment:read",
    "obligation:read",
    "obligation_impact:read",
    "obligation_assessment_result:read",
    "obligation_change:read",
    "obligation_change_attestation:read"
  ]

  depends_on = [
    permitio_resource.compliance_monitoring_assessment,
    permitio_resource.obligation,
    permitio_resource.obligation_assessment_result,
    permitio_resource.obligation_impact,
    permitio_resource.obligation_change,
    permitio_resource.obligation_change_attestation
  ]
}
resource "permitio_role" "ComplianceManager" {
  key  = "ComplianceManager"
  name = "ComplianceManager"
  permissions = [
    "compliance_monitoring_assessment:read",
    "compliance_monitoring_assessment:insert",
    "compliance_monitoring_assessment:update",
    "compliance_monitoring_assessment:delete",
    "obligation:read",
    "obligation:insert",
    "obligation:update",
    "obligation:delete",
    "obligation_assessment_result:read",
    "obligation_assessment_result:insert",
    "obligation_assessment_result:update",
    "obligation_assessment_result:delete",
    "obligation_impact:delete",
    "obligation_impact:insert",
    "obligation_impact:read",
    "obligation_impact:update",
    "obligation_change:read",
    "obligation_change:update",
    "obligation_change:delete",
    "obligation_change:insert",
    "obligation_change_attestation:read",
    "obligation_change_attestation:update",
    "obligation_change_attestation:delete",
    "obligation_change_attestation:insert",
    "compliance_form_configuration:update",
    "compliance_monitoring_assessment_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.compliance_monitoring_assessment,
    permitio_resource.obligation,
    permitio_resource.obligation_assessment_result,
    permitio_resource.obligation_impact,
    permitio_resource.obligation_change,
    permitio_resource.obligation_change_attestation,
    permitio_resource.compliance_form_configuration,
    permitio_resource.compliance_monitoring_assessment_form_configuration
  ]
}
resource "permitio_role" "ControlGroupViewer" {
  key  = "ControlGroupViewer"
  name = "ControlGroupViewer"
  permissions = [
    "control_group:read"
  ]

  depends_on = [
    permitio_resource.control_group
  ]
}
resource "permitio_role" "ControlGroupManager" {
  key  = "ControlGroupManager"
  name = "ControlGroupManager"
  permissions = [
    "control_group:read",
    "control_group:insert",
    "control_group:update",
    "control_group:delete"
  ]

  depends_on = [
    permitio_resource.control_group
  ]
}
resource "permitio_role" "ControlViewer" {
  key  = "ControlViewer"
  name = "ControlViewer"
  permissions = [
    "control:read",
    "control_group:read",
    "test_result:read"
  ]

  depends_on = [
    permitio_resource.control,
    permitio_resource.control_group,
    permitio_resource.test_result,
  ]
}
resource "permitio_role" "ControlManager" {
  key  = "ControlManager"
  name = "ControlManager"
  permissions = [
    "control:read",
    "control:insert",
    "control:update",
    "control:delete",
    "control_group:read",
    "control_group:insert",
    "control_group:update",
    "control_group:delete",
    "test_result:delete",
    "test_result:insert",
    "test_result:read",
    "test_result:update",
    "control_form_configuration:update",
    "control_group_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.control,
    permitio_resource.control_group,
    permitio_resource.test_result,
    permitio_resource.control_form_configuration,
    permitio_resource.control_group_form_configuration
  ]
}
resource "permitio_role" "CustomerSuccess" {
  key  = "CustomerSuccess"
  name = "CustomerSuccess"
  permissions = [
    "acceptance:delete",
    "acceptance:insert",
    "acceptance:read",
    "acceptance:update",
    "action_update:delete",
    "action_update:insert",
    "action_update:read",
    "action_update:update",
    "action:delete",
    "action:insert",
    "action:read",
    "action:update",
    "appetite:delete",
    "appetite:insert",
    "appetite:read",
    "appetite:update",
    "assessment_activity:delete",
    "assessment_activity:insert",
    "assessment_activity:read",
    "assessment_activity:update",
    "assessment:delete",
    "assessment:insert",
    "assessment:read",
    "assessment:update",
    "attestation_record:delete",
    "attestation_record:insert",
    "attestation_record:read",
    "attestation_record:update",
    "aggregation_org:delete",
    "aggregation_org:insert",
    "aggregation_org:read",
    "aggregation_org:update",
    "approval_result:delete",
    "approval_result:insert",
    "approval_result:read",
    "approval_result:update",
    "audit:delete",
    "audit:insert",
    "audit:read",
    "audit:update",
    "business_area:delete",
    "business_area:insert",
    "business_area:read",
    "business_area:update",
    "cause:delete",
    "cause:insert",
    "cause:read",
    "cause:update",
    "change_request:delete",
    "change_request:insert",
    "change_request:read",
    "change_request:update",
    "compliance_monitoring_assessment:delete",
    "compliance_monitoring_assessment:insert",
    "compliance_monitoring_assessment:read",
    "compliance_monitoring_assessment:update",
    "consequence:delete",
    "consequence:insert",
    "consequence:read",
    "consequence:update",
    "contributor_group:delete",
    "contributor_group:insert",
    "contributor_group:read",
    "contributor_group:update",
    "control_group:delete",
    "control_group:insert",
    "control_group:read",
    "control_group:update",
    "control:delete",
    "control:insert",
    "control:read",
    "control:update",
    "conversation:delete",
    "conversation:insert",
    "conversation:read",
    "conversation:update",
    "custom_attribute_schema:delete",
    "custom_attribute_schema:insert",
    "custom_attribute_schema:read",
    "custom_attribute_schema:update",
    "custom_datasource:delete",
    "custom_datasource:insert",
    "custom_datasource:read",
    "custom_datasource:update",
    "custom_ribbon:delete",
    "custom_ribbon:insert",
    "custom_ribbon:read",
    "custom_ribbon:update",
    "custom_role:read",
    "custom_role:delete",
    "custom_role:insert",
    "custom_role:update",
    "dashboard:delete",
    "dashboard:insert",
    "dashboard:read",
    "dashboard:update",
    "data_export:delete",
    "data_export:insert",
    "data_export:read",
    "data_export:update",
    "data_import:delete",
    "data_import:insert",
    "data_import:read",
    "data_import:update",
    "department_type:delete",
    "department_type:insert",
    "department_type:read",
    "department_type:update",
    "document_file:delete",
    "document_file:insert",
    "document_file:read",
    "document_file:update",
    "document:delete",
    "document:insert",
    "document:read",
    "document:update",
    "document_assessment_result:delete",
    "document_assessment_result:insert",
    "document_assessment_result:read",
    "document_assessment_result:update",
    "enterprise_risk:delete",
    "enterprise_risk:insert",
    "enterprise_risk:read",
    "enterprise_risk:update",
    "entity:delete",
    "entity:insert",
    "entity:read",
    "entity:update",
    "external_api:delete",
    "external_api:insert",
    "external_api:read",
    "external_api:update",
    "impact:delete",
    "impact:insert",
    "impact:read",
    "impact:update",
    "impact_rating:delete",
    "impact_rating:insert",
    "impact_rating:read",
    "impact_rating:update",
    "indicator_result:delete",
    "indicator_result:insert",
    "indicator_result:read",
    "indicator_result:update",
    "indicator:delete",
    "indicator:insert",
    "indicator:read",
    "indicator:update",
    "internal_audit_entity:delete",
    "internal_audit_entity:insert",
    "internal_audit_entity:read",
    "internal_audit_entity:update",
    "internal_audit_report:delete",
    "internal_audit_report:insert",
    "internal_audit_report:read",
    "internal_audit_report:update",
    "issue_assessment:delete",
    "issue_assessment:insert",
    "issue_assessment:read",
    "issue_assessment:update",
    "issue:delete",
    "issue:insert",
    "issue:read",
    "issue:update",
    "issue_update:delete",
    "issue_update:insert",
    "issue_update:read",
    "issue_update:update",
    "linked_item:delete",
    "linked_item:insert",
    "linked_item:read",
    "linked_item:update",
    "my_items:delete",
    "my_items:insert",
    "my_items:read",
    "my_items:update",
    "multi_reporting:delete",
    "multi_reporting:insert",
    "multi_reporting:read",
    "multi_reporting:update",
    "notification:delete",
    "notification:insert",
    "notification:read",
    "notification:update",
    "obligation_assessment_result:delete",
    "obligation_assessment_result:insert",
    "obligation_assessment_result:read",
    "obligation_assessment_result:update",
    "obligation:delete",
    "obligation:insert",
    "obligation:read",
    "obligation:update",
    "obligation_impact:delete",
    "obligation_impact:insert",
    "obligation_impact:read",
    "obligation_impact:update",
    "obligation_change:read",
    "obligation_change:update",
    "obligation_change:delete",
    "obligation_change:insert",
    "obligation_change_attestation:read",
    "obligation_change_attestation:update",
    "obligation_change_attestation:delete",
    "obligation_change_attestation:insert",
    "organisation_dashboard:delete",
    "organisation_dashboard:insert",
    "organisation_dashboard:read",
    "organisation_dashboard:update",
    "organisation_module:delete",
    "organisation_module:insert",
    "organisation_module:read",
    "organisation_module:update",
    "organisation_tab_preference:delete",
    "organisation_tab_preference:insert",
    "organisation_tab_preference:read",
    "organisation_tab_preference:update",
    "questionnaire_template_version:delete",
    "questionnaire_template_version:insert",
    "questionnaire_template_version:read",
    "questionnaire_template_version:update",
    "owner_group:delete",
    "owner_group:insert",
    "owner_group:read",
    "owner_group:update",
    "permit_sync:read",
    "permit_sync:insert",
    "permit_sync:update",
    "permit_sync:delete",
    "public_issue_form:delete",
    "public_issue_form:insert",
    "public_issue_form:read",
    "public_issue_form:update",
    "public_policies:delete",
    "public_policies:insert",
    "public_policies:read",
    "public_policies:update",
    "questionnaire_template:delete",
    "questionnaire_template:insert",
    "questionnaire_template:read",
    "questionnaire_template:update",
    "report:delete",
    "report:insert",
    "report:read",
    "report:update",
    "risk_assessment_result:delete",
    "risk_assessment_result:insert",
    "risk_assessment_result:read",
    "risk_assessment_result:update",
    "risk_tier_1:delete",
    "risk_tier_1:insert",
    "risk_tier_1:read",
    "risk_tier_1:update",
    "risk:delete",
    "risk:insert",
    "risk:read",
    "risk:update",
    "rs_node:delete",
    "rs_node:insert",
    "rs_node:read",
    "rs_node:update",
    "scim_configuration:delete",
    "scim_configuration:insert",
    "scim_configuration:read",
    "scim_configuration:update",
    "sso_configuration:delete",
    "sso_configuration:insert",
    "sso_configuration:read",
    "sso_configuration:update",
    "settings:read",
    "settings:insert",
    "settings:update",
    "settings:delete",
    "settings_users:read",
    "settings_users:insert",
    "settings_users:update",
    "settings_users:delete",
    "settings_user_groups:read",
    "settings_user_groups:insert",
    "settings_user_groups:update",
    "settings_user_groups:delete",
    "settings_approvals:read",
    "settings_approvals:insert",
    "settings_approvals:update",
    "settings_approvals:delete",
    "settings_audit:read",
    "settings_audit:insert",
    "settings_audit:update",
    "settings_audit:delete",
    "settings_module:read",
    "settings_module:insert",
    "settings_module:update",
    "settings_module:delete",
    "settings_tags:read",
    "settings_tags:insert",
    "settings_tags:update",
    "settings_tags:delete",
    "settings_departments:delete",
    "settings_departments:insert",
    "settings_departments:read",
    "settings_departments:update",
    "tag_type:delete",
    "tag_type:insert",
    "tag_type:read",
    "tag_type:update",
    "taxonomy:delete",
    "taxonomy:insert",
    "taxonomy:read",
    "taxonomy:update",
    "test_result:delete",
    "test_result:insert",
    "test_result:read",
    "test_result:update",
    "third_party_response:delete",
    "third_party_response:insert",
    "third_party_response:read",
    "third_party_response:update",
    "third_party:delete",
    "third_party:insert",
    "third_party:read",
    "third_party:update",
    "user_group:delete",
    "user_group:insert",
    "user_group:read",
    "user_group:update",
    "user_tab_preference:delete",
    "user_tab_preference:insert",
    "user_tab_preference:read",
    "user_tab_preference:update",
    "risk_form_configuration:update",
    "control_form_configuration:update",
    "control_group_form_configuration:update",
    "issue_form_configuration:update",
    "action_form_configuration:update",
    "policy_form_configuration:update",
    "compliance_form_configuration:update",
    "indicator_form_configuration:update",
    "assessment_form_configuration:update",
    "internal_audit_entity_form_configuration:update",
    "internal_audit_report_form_configuration:update",
    "third_party_form_configuration:update",
    "compliance_monitoring_assessment_form_configuration:update",
    "sso_configuration:delete",
    "sso_configuration:insert",
    "sso_configuration:read",
    "sso_configuration:update",
    "ingestion_config:read",
    "ingestion_config:insert",
    "ingestion_config:update",
    "ingestion_config:delete"
  ]

  depends_on = [
    permitio_resource.acceptance,
    permitio_resource.action_update,
    permitio_resource.action,
    permitio_resource.aggregation_org,
    permitio_resource.approval_result,
    permitio_resource.audit,
    permitio_resource.appetite,
    permitio_resource.assessment_activity,
    permitio_resource.assessment,
    permitio_resource.attestation_record,
    permitio_resource.business_area,
    permitio_resource.cause,
    permitio_resource.change_request,
    permitio_resource.compliance_monitoring_assessment,
    permitio_resource.consequence,
    permitio_resource.contributor_group,
    permitio_resource.control_group,
    permitio_resource.control,
    permitio_resource.conversation,
    permitio_resource.custom_attribute_schema,
    permitio_resource.custom_datasource,
    permitio_resource.custom_ribbon,
    permitio_resource.custom_role,
    permitio_resource.dashboard,
    permitio_resource.data_export,
    permitio_resource.data_import,
    permitio_resource.department_type,
    permitio_resource.document_file,
    permitio_resource.document,
    permitio_resource.document_assessment_result,
    permitio_resource.enterprise_risk,
    permitio_resource.entity,
    permitio_resource.external_api,
    permitio_resource.impact,
    permitio_resource.impact_rating,
    permitio_resource.indicator_result,
    permitio_resource.indicator,
    permitio_resource.ingestion_config,
    permitio_resource.internal_audit_entity,
    permitio_resource.internal_audit_report,
    permitio_resource.issue_assessment,
    permitio_resource.issue,
    permitio_resource.issue_update,
    permitio_resource.linked_item,
    permitio_resource.my_items,
    permitio_resource.multi_reporting,
    permitio_resource.notification,
    permitio_resource.obligation_assessment_result,
    permitio_resource.obligation,
    permitio_resource.obligation_impact,
    permitio_resource.obligation_change,
    permitio_resource.obligation_change_attestation,
    permitio_resource.organisation_dashboard,
    permitio_resource.organisation_module,
    permitio_resource.organisation_tab_preference,
    permitio_resource.questionnaire_template_version,
    permitio_resource.owner_group,
    permitio_resource.permit_sync,
    permitio_resource.public_issue_form,
    permitio_resource.public_policies,
    permitio_resource.questionnaire_template,
    permitio_resource.report,
    permitio_resource.risk_assessment_result,
    permitio_resource.risk_tier_1,
    permitio_resource.risk,
    permitio_resource.rs_node,
    permitio_resource.scim_configuration,
    permitio_resource.sso_configuration,
    permitio_resource.settings_approvals,
    permitio_resource.settings_audit,
    permitio_resource.settings_departments,
    permitio_resource.settings_tags,
    permitio_resource.settings_user_groups,
    permitio_resource.settings,
    permitio_resource.settings_users,
    permitio_resource.tag_type,
    permitio_resource.taxonomy,
    permitio_resource.test_result,
    permitio_resource.third_party_response,
    permitio_resource.third_party,
    permitio_resource.user_group,
    permitio_resource.user_tab_preference,
    permitio_resource.risk_form_configuration,
    permitio_resource.control_form_configuration,
    permitio_resource.control_group_form_configuration,
    permitio_resource.issue_form_configuration,
    permitio_resource.action_form_configuration,
    permitio_resource.policy_form_configuration,
    permitio_resource.compliance_form_configuration,
    permitio_resource.indicator_form_configuration,
    permitio_resource.assessment_form_configuration,
    permitio_resource.internal_audit_entity_form_configuration,
    permitio_resource.internal_audit_report_form_configuration,
    permitio_resource.third_party_form_configuration,
    permitio_resource.compliance_monitoring_assessment_form_configuration,
    permitio_resource.sso_configuration
  ]
}
resource "permitio_role" "IndicatorViewer" {
  key  = "IndicatorViewer"
  name = "IndicatorViewer"
  permissions = [
    "indicator:read",
    "indicator_result:read"
  ]

  depends_on = [
    permitio_resource.indicator,
    permitio_resource.indicator_result
  ]
}
resource "permitio_role" "IndicatorManager" {
  key  = "IndicatorManager"
  name = "IndicatorManager"
  permissions = [
    "indicator:read",
    "indicator:insert",
    "indicator:update",
    "indicator:delete",
    "indicator_result:read",
    "indicator_result:insert",
    "indicator_result:update",
    "indicator_result:delete",
    "indicator_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.indicator,
    permitio_resource.indicator_result,
    permitio_resource.indicator_form_configuration
  ]
}
resource "permitio_role" "IssueViewer" {
  key  = "IssueViewer"
  name = "IssueViewer"
  permissions = [
    "issue:read",
    "issue_assessment:read",
    "cause:read",
    "consequence:read",
    "issue_update:read"
  ]

  depends_on = [
    permitio_resource.cause,
    permitio_resource.consequence,
    permitio_resource.issue,
    permitio_resource.issue_assessment,
    permitio_resource.issue_update
  ]
}
resource "permitio_role" "IssueManager" {
  key  = "IssueManager"
  name = "IssueManager"
  permissions = [
    "issue:read",
    "issue:insert",
    "issue:update",
    "issue:delete",
    "issue_assessment:read",
    "issue_assessment:insert",
    "issue_assessment:update",
    "issue_assessment:delete",
    "issue_update:read",
    "issue_update:insert",
    "issue_update:update",
    "issue_update:delete",
    "issue_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.issue,
    permitio_resource.issue_assessment,
    permitio_resource.issue_update,
    permitio_resource.issue_form_configuration
  ]
}
resource "permitio_role" "PolicyViewer" {
  key  = "PolicyViewer"
  name = "PolicyViewer"
  permissions = [
    "public_policies:read",
    "document:read",
    "attestation_cycle:read"
  ]

  depends_on = [
    permitio_resource.public_policies,
    permitio_resource.document,
    permitio_resource.attestation_cycle
  ]
}
resource "permitio_role" "PolicyManager" {
  key  = "PolicyManager"
  name = "PolicyManager"
  permissions = [
    "public_policies:read",
    "public_policies:insert",
    "public_policies:update",
    "public_policies:delete",
    "document:read",
    "document:insert",
    "document:update",
    "document:delete",
    "attestation_cycle:read",
    "attestation_cycle:insert",
    "attestation_cycle:update",
    "policy_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.public_policies,
    permitio_resource.document,
    permitio_resource.attestation_cycle,
    permitio_resource.policy_form_configuration
  ]
}
resource "permitio_role" "SettingsManager" {
  key  = "SettingsManager"
  name = "SettingsManager"
  permissions = [
    "colour_palette:delete",
    "colour_palette:insert",
    "colour_palette:update",
    "custom_role:delete",
    "custom_role:insert",
    "custom_role:update",
    "data_export:delete",
    "data_export:insert",
    "data_export:read",
    "data_export:update",
    "entity:delete",
    "entity:insert",
    "entity:read",
    "entity:update",
    "settings:read",
    "settings:insert",
    "settings:update",
    "settings:delete",
    "settings_users:read",
    "settings_users:insert",
    "settings_users:update",
    "settings_users:delete",
    "settings_user_groups:read",
    "settings_user_groups:insert",
    "settings_user_groups:update",
    "settings_user_groups:delete",
    "settings_approvals:read",
    "settings_approvals:insert",
    "settings_approvals:update",
    "settings_approvals:delete",
    "settings_audit:read",
    "settings_audit:insert",
    "settings_audit:update",
    "settings_audit:delete",
    "settings_module:read",
    "settings_tags:read",
    "settings_tags:insert",
    "settings_tags:update",
    "settings_tags:delete",
    "settings_departments:delete",
    "settings_departments:insert",
    "settings_departments:read",
    "settings_departments:update",
    "ingestion_config:read",
    "ingestion_config:insert",
    "ingestion_config:update",
    "ingestion_config:delete"
  ]

  depends_on = [
    permitio_resource.colour_palette,
    permitio_resource.data_export,
    permitio_resource.entity,
    permitio_resource.ingestion_config,
    permitio_resource.settings,
    permitio_resource.settings_users,
    permitio_resource.settings_user_groups,
    permitio_resource.settings_approvals,
    permitio_resource.settings_audit,
    permitio_resource.settings_departments,
    permitio_resource.settings_module,
    permitio_resource.settings_tags,
    permitio_resource.custom_role
  ]
}
resource "permitio_role" "ThirdPartyViewer" {
  key  = "ThirdPartyViewer"
  name = "ThirdPartyViewer"
  permissions = [
    "third_party:read",
    "third_party_response:read",
    "questionnaire_template:read",
    "questionnaire_template_version:read"
  ]

  depends_on = [
    permitio_resource.third_party,
    permitio_resource.third_party_response,
    permitio_resource.questionnaire_template,
    permitio_resource.questionnaire_template_version
  ]
}
resource "permitio_role" "ThirdPartyManager" {
  key  = "ThirdPartyManager"
  name = "ThirdPartyManager"
  permissions = [
    "third_party:read",
    "third_party:insert",
    "third_party:update",
    "third_party:delete",
    "third_party_response:read",
    "third_party_response:insert",
    "third_party_response:update",
    "third_party_response:delete",
    "questionnaire_template:delete",
    "questionnaire_template:insert",
    "questionnaire_template:read",
    "questionnaire_template:update",
    "questionnaire_template_version:delete",
    "questionnaire_template_version:insert",
    "questionnaire_template_version:read",
    "questionnaire_template_version:update",
    "third_party_form_configuration:update"
  ]

  depends_on = [
    permitio_resource.third_party,
    permitio_resource.third_party_response,
    permitio_resource.questionnaire_template,
    permitio_resource.questionnaire_template_version,
    permitio_resource.third_party_form_configuration
  ]
}
resource "permitio_role" "CustomDataSourceViewer" {
  key  = "CustomDataSourceViewer"
  name = "CustomDataSourceViewer"
  permissions = [
    "custom_datasource:read"
  ]

  depends_on = [
    permitio_resource.custom_datasource
  ]
}
resource "permitio_role" "CustomDataSourceManager" {
  key  = "CustomDataSourceManager"
  name = "CustomDataSourceManager"
  permissions = [
    "custom_datasource:read",
    "custom_datasource:insert",
    "custom_datasource:update",
    "custom_datasource:delete"
  ]

  depends_on = [
    permitio_resource.custom_datasource
  ]
}

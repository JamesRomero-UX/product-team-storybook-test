/**
 * Parent Types
 *
 * Parent types are all entries in the risksmart.node_type table
 * This includes all domain objects, including those that do not have triggers to maintain the node table
 * These exist for a number of reasons
 *
 * 1. To define all possible parent types for relationships
 * 2. To drive permissions and access control,
 * e.g linked_item, settings, custom_role, colour_palette etc
 */

export const ParentTypes = {
  /** Acceptance */
  Acceptance: 'acceptance',
  /** Action */
  Action: 'action',
  /** Action Update */
  ActionUpdate: 'action_update',
  /** Aggregation settings */
  AggregationOrg: 'aggregation_org',
  /** Appetite */
  Appetite: 'appetite',
  /** Approval result */
  ApprovalResult: 'approval_result',
  /** Assessment */
  Assessment: 'assessment',
  /** Assessment Activity */
  AssessmentActivity: 'assessment_activity',
  /** Generic assessment result parent for register */
  AssessmentResult: 'assessment_result',
  /** Attestation Cycle */
  AttestationCycle: 'attestation_cycle',
  /** Attestation Record */
  AttestationRecord: 'attestation_record',
  /** Audit entities */
  Audit: 'audit',
  /** Business Area */
  BusinessArea: 'business_area',
  /** Cause */
  Cause: 'cause',
  /** Change Request */
  ChangeRequest: 'change_request',
  /** Colour Palette */
  ColourPalette: 'colour_palette',
  /** Compliance Monitoring Assessment */
  ComplianceMonitoringAssessment: 'compliance_monitoring_assessment',
  /** Compliance Monitoring Assessment Result */
  ComplianceMonitoringAssessmentResult:
    'compliance_monitoring_assessment_result',
  /** Consequence */
  Consequence: 'consequence',
  /** Control */
  Control: 'control',
  /** Control Group */
  ControlGroup: 'control_group',
  /** Controlled Risk Assessment Result */
  ControlledRiskAssessmentResult: 'controlled_risk_assessment_result',
  /** Control test internal audit result */
  ControlTestInternalAuditResult: 'control_test_internal_audit_result',
  /** Control test second line result */
  ControlTestSecondLineResult: 'control_test_second_line_result',
  /** Conversation */
  Conversation: 'conversation',
  /** Custom attribute schema */
  CustomAttributeSchema: 'custom_attribute_schema',
  /** CustomDatasource */
  CustomDatasource: 'custom_datasource',
  /** Custom Ribbon Item */
  CustomRibbon: 'custom_ribbon',
  /** Custom Role */
  CustomRole: 'custom_role',
  /** Dashboard */
  Dashboard: 'dashboard',
  /** Data Export */
  DataExport: 'data_export',
  /** Data Import */
  DataImport: 'data_import',
  /** Department Type */
  DepartmentType: 'department_type',
  /** Document */
  Document: 'document',
  /** Document Assessment */
  DocumentAssessment: 'document_assessment',
  /** Document Assessment Result */
  DocumentAssessmentResult: 'document_assessment_result',
  /** Document version */
  DocumentFile: 'document_file',
  /** Document internal audit result */
  DocumentInternalAuditResult: 'document_internal_audit_result',
  /** Document second line result */
  DocumentSecondLineResult: 'document_second_line_result',
  /** Enterprise Risk */
  EnterpriseRisk: 'enterprise_risk',
  /** Entity */
  Entity: 'entity',
  /** External API */
  ExternalApi: 'external_api',
  /** Impact */
  Impact: 'impact',
  /** Impact internal audit rating */
  ImpactInternalAuditRating: 'impact_internal_audit_rating',
  /** Impact Parent */
  ImpactParent: 'impact_parent',
  /** Impact rating */
  ImpactRating: 'impact_rating',
  /** Impact second line rating */
  ImpactSecondLineRating: 'impact_second_line_rating',
  /** Indicator */
  Indicator: 'indicator',
  /** Indicator Result */
  IndicatorResult: 'indicator_result',
  /** Internal Audit */
  InternalAuditEntity: 'internal_audit_entity',
  /** Internal Audit Report */
  InternalAuditReport: 'internal_audit_report',
  /** Internal Audit Report Result */
  InternalAuditReportResult: 'internal_audit_report_result',
  /** Issue */
  Issue: 'issue',
  /** Issue Assessment */
  IssueAssessment: 'issue_assessment',
  /** Issue assessment audit */
  IssueAssessmentAudit: 'issue_assessment_audit',
  /** issue assessment breach log */
  IssueAssessmentBreachLog: 'issue_assessment_breach_log',
  /** issue assessment consumer duty */
  IssueAssessmentConsumerDuty: 'issue_assessment_consumer_duty',
  /** issue assessment customer trust */
  IssueAssessmentCustomerTrust: 'issue_assessment_customer_trust',
  /** issue assessment gdpr breach log */
  IssueAssessmentGdprBreachLog: 'issue_assessment_gdpr_breach_log',
  /** issue assessment pci breach log */
  IssueAssessmentPciBreachLog: 'issue_assessment_pci_breach_log',
  /** issue assessment risk event */
  IssueAssessmentRiskEvent: 'issue_assessment_risk_event',
  /** issue assessment sar log */
  IssueAssessmentSarLog: 'issue_assessment_sar_log',
  /** issue breach log */
  IssueBreachLog: 'issue_breach_log',
  /** issue consumer duty */
  IssueConsumerDuty: 'issue_consumer_duty',
  /** issue customer trust */
  IssueCustomerTrust: 'issue_customer_trust',
  /** issue gdpr breach log */
  IssueGdprBreachLog: 'issue_gdpr_breach_log',
  /** issue pci breach log */
  IssuePciBreachLog: 'issue_pci_breach_log',
  /** issue risk event */
  IssueRiskEvent: 'issue_risk_event',
  /** issue sar log */
  IssueSarLog: 'issue_sar_log',
  /** Issue Update */
  IssueUpdate: 'issue_update',
  /** Linked item */
  LinkedItem: 'linked_item',
  /** Multiple datasource reporting */
  MultiReporting: 'multi_reporting',
  /** My items */
  MyItems: 'my_items',
  /** Notification */
  Notification: 'notification',
  /** Obligation */
  Obligation: 'obligation',
  /** Obligation Assessment */
  ObligationAssessment: 'obligation_assessment',
  /** Obligation Assessment Result */
  ObligationAssessmentResult: 'obligation_assessment_result',
  /** Obligation Impact */
  ObligationImpact: 'obligation_impact',
  /** Obligation internal audit result */
  ObligationInternalAuditResult: 'obligation_internal_audit_result',
  /** Obligation second line result */
  ObligationSecondLineResult: 'obligation_second_line_result',
  /** Obligation Change */
  ObligationChange: 'obligation_change',
  /** Obligation Change Attestation */
  ObligationChangeAttestation: 'obligation_change_attestation',
  /** Organisation shared dashboards */
  OrganisationDashboard: 'organisation_dashboard',
  /** Organisation Modules */
  OrganisationModule: 'organisation_module',
  /** Organisation Tab Preference */
  OrganisationTabPreference: 'organisation_tab_preference',
  /** Public issue form */
  PublicIssueForm: 'public_issue_form',
  /** Public policies */
  PublicPolicies: 'public_policies',
  /** Questionnaire Template */
  QuestionnaireTemplate: 'questionnaire_template',
  /** Questionnaire Template Version */
  QuestionnaireTemplateVersion: 'questionnaire_template_version',
  /** Reports */
  Report: 'report',
  /** Risk */
  Risk: 'risk',
  /** Risk assessment */
  RiskAssessment: 'risk_assessment',
  /** Risk Assessment Result */
  RiskAssessmentResult: 'risk_assessment_result',
  /** Risk Assessment Result Config **/
  RiskAssessmentResultConfig: 'risk_assessment_result_config',
  /** Risk Assessment Result Impact */
  RiskAssessmentResultImpact: 'risk_assessment_result_impact',
  /** Risk Controlled Assessment */
  RiskControlledAssessment: 'risk_controlled_assessment',
  /** Risk controlled internal audit result */
  RiskControlledInternalAuditResult: 'risk_controlled_internal_audit_result',
  /** Risk controlled second line result */
  RiskControlledSecondLineResult: 'risk_controlled_second_line_result',
  /** Tier 1 risk */
  RiskTier1: 'risk_tier_1',
  /** Risk Uncontrolled Assessment */
  RiskUncontrolledAssessment: 'risk_uncontrolled_assessment',
  /** Risk uncontrolled internal audit result */
  RiskUncontrolledInternalAuditResult:
    'risk_uncontrolled_internal_audit_result',
  /** Risk uncontrolled second line result */
  RiskUncontrolledSecondLineResult: 'risk_uncontrolled_second_line_result',
  /** Scim Configuration */
  ScimConfiguration: 'scim_configuration',
  /** SSO Configuration */
  SsoConfiguration: 'sso_configuration',
  /** Settings */
  Settings: 'settings',
  /** Approvals Settings */
  SettingsApprovals: 'settings_approvals',
  /** Audit Settings */
  SettingsAudit: 'settings_audit',
  /** Department Settings */
  SettingsDepartments: 'settings_departments',
  /** Module Settings */
  SettingsModule: 'settings_module',
  /** Tag Settings */
  SettingsTags: 'settings_tags',
  /** User Group Settings */
  SettingsUserGroups: 'settings_user_groups',
  /** User Settings */
  SettingsUsers: 'settings_users',
  /** Tag type */
  TagType: 'tag_type',
  /** Taxonomy */
  Taxonomy: 'taxonomy',
  /** Test Result */
  TestResult: 'test_result',
  /** Third Party */
  ThirdParty: 'third_party',
  /** Third Party Response */
  ThirdPartyResponse: 'third_party_response',
  /** Uncontrolled Risk Assessment Result */
  UncontrolledRiskAssessmentResult: 'uncontrolled_risk_assessment_result',
  /** User Tab Preference */
  UserTabPreference: 'user_tab_preference',
} as const;

export type ParentType = (typeof ParentTypes)[keyof typeof ParentTypes];

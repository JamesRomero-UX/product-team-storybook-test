import type { ParentType } from '@risksmart-app/domain/src/types/consts';

/**
 * Maps ParentType to the ResourceType that governs form configuration access.
 *
 * Uses domain-owner approach: child entities map to their parent domain's resource type.
 * This enables RBAC-based form configuration permissions where Manager roles
 * (e.g., RiskManager, ControlManager) can update form configs for their domain.
 *
 * Note: Not all ParentType values have customizable forms, so this is a Partial mapping.
 * Parent types without form configuration are intentionally omitted.
 */
export const FORM_CONFIG_RESOURCE_TYPE_MAP: Partial<
  Record<ParentType, string>
> = {
  // Risk domain → 'risk' (RiskManager)
  risk: 'risk',
  acceptance: 'risk',
  appetite: 'risk',
  impact: 'risk',
  impact_rating: 'risk',
  controlled_risk_assessment_result: 'risk',
  uncontrolled_risk_assessment_result: 'risk',

  // Control domain → 'control' / 'control_group' (ControlManager)
  control: 'control',
  test_result: 'control',
  control_group: 'control_group',

  // Issue domain → 'issue' (IssueManager)
  issue: 'issue',
  issue_breach_log: 'issue',
  issue_consumer_duty: 'issue',
  issue_customer_trust: 'issue',
  issue_gdpr_breach_log: 'issue',
  issue_pci_breach_log: 'issue',
  issue_risk_event: 'issue',
  issue_sar_log: 'issue',
  cause: 'issue',
  consequence: 'issue',
  issue_update: 'issue',
  issue_assessment: 'issue',
  issue_assessment_breach_log: 'issue',
  issue_assessment_consumer_duty: 'issue',
  issue_assessment_customer_trust: 'issue',
  issue_assessment_gdpr_breach_log: 'issue',
  issue_assessment_pci_breach_log: 'issue',
  issue_assessment_risk_event: 'issue',
  issue_assessment_sar_log: 'issue',

  // Action domain → 'action' (ActionManager)
  action: 'action',
  action_update: 'action',

  // Policy/Document domain → 'policy' (PolicyManager)
  document: 'policy',
  document_file: 'policy',
  document_assessment_result: 'policy',
  document_second_line_result: 'policy',
  attestation_cycle: 'policy',

  // Compliance domain → 'compliance' (ComplianceManager)
  obligation: 'compliance',
  obligation_impact: 'compliance',
  obligation_assessment_result: 'compliance',

  // Map all second line result forms to 'compliance_monitoring_assessment' resource type
  obligation_second_line_result: 'compliance_monitoring_assessment',
  compliance_monitoring_assessment: 'compliance_monitoring_assessment',
  risk_controlled_second_line_result: 'compliance_monitoring_assessment',
  risk_uncontrolled_second_line_result: 'compliance_monitoring_assessment',
  control_test_second_line_result: 'compliance_monitoring_assessment',

  // Indicator domain → 'indicator' (IndicatorManager)
  indicator: 'indicator',
  indicator_result: 'indicator',

  // Assessment domain → 'assessment' (AssessmentManager)
  assessment: 'assessment',
  assessment_activity: 'assessment',

  // Internal Audit domain (InternalAuditManager)
  internal_audit_entity: 'internal_audit_entity',
  internal_audit_report: 'internal_audit_report',
  risk_controlled_internal_audit_result: 'internal_audit_entity',
  risk_uncontrolled_internal_audit_result: 'internal_audit_entity',
  document_internal_audit_result: 'internal_audit_entity',
  obligation_internal_audit_result: 'internal_audit_entity',
  control_test_internal_audit_result: 'internal_audit_entity',

  // Third Party domain → 'third_party' (ThirdPartyManager)
  third_party: 'third_party',
  questionnaire_template: 'third_party',
};

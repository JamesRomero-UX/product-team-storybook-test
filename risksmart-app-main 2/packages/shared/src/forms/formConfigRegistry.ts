import type { OrgFeature } from '@risksmart-app/modules/src/index';

import { getAcceptanceFormConfig } from './acceptance/acceptanceFormConfig';
import { getActionUpdateFormConfig } from './action-update/actionUpdateFormConfig';
import { getActionFormConfig } from './actions/actionFormConfig';
import { getAppetiteFormConfig } from './appetites/appetiteFormConfig';
import { getAssessmentActivityFormConfig } from './assessment-activity/assessmentActivityFormConfig';
import { getAssessmentFormConfig } from './assessments/assessmentFormConfig';
import { getAttestationCycleFormConfig } from './attestation-cycle/attestationCycleFormConfig';
import { getCauseFormConfig } from './causes/causeFormConfig';
import { getConsequenceFormConfig } from './consequences/consequenceFormConfig';
import { getControlGroupFormConfig } from './control-group/controlGroupFormConfig';
import { getControlFormConfig } from './controls/controlFormConfig';
import { getDocumentFormConfig } from './document/documentFormConfig';
import { getDocumentAssessmentResultFormConfig } from './document-assessment-result/documentAssessmentResultFormConfig';
import { getDocumentFileFormConfig } from './document-file/documentFileFormConfig';
import { getImpactFormConfig } from './impact/impactFormConfig';
import { getImpactRatingFormConfig } from './impact-rating/impactRatingFormConfig';
import { getIndicatorResultFormConfig } from './indicator-result/indicatorResultFormConfig';
import { getIndicatorFormConfig } from './indicators/indicatorFormConfig';
import { getInternalAuditEntityFormConfig } from './internal-audit-entity/internalAuditEntityFormConfig';
import { getIssueAssessmentFormConfig } from './issue-assessments/issueAssesmentFormConfig';
import { getIssueUpdateFormConfig } from './issue-update/issueUpdateFormConfig';
import { getIssueFormConfig } from './issues/issueFormConfig';
import { getObligationFormConfig } from './obligation/obligationFormConfig';
import { getObligationAssessmentResultFormConfig } from './obligation-assessment-result/obligationAssessmentResultFormConfig';
import { getObligationImpactFormConfig } from './obligation-impact/obligationImpactFormConfig';
import { getQuestionnaireTemplateFormConfig } from './questionnaire-template/questionnaireTemplateFormConfig';
import { getRiskAssessmentResultFormConfig } from './risk-assessment-result/riskAssessmentResultFormConfig';
import { getRiskFormConfig } from './risks/riskFormConfig';
import { getTestResultFormConfig } from './test-results/testResultsFormConfig';
import { getThirdPartyFormConfig } from './third-party/thirdPartyFormConfig';

let formRegistry: FormRegistry | null = null;

export const createFormConfigRegistry = (enabledFeatures: OrgFeature[]) =>
  ({
    impact_rating: getImpactRatingFormConfig(),
    questionnaire_template: getQuestionnaireTemplateFormConfig(),
    internal_audit_entity: getInternalAuditEntityFormConfig(),
    obligation_impact: getObligationImpactFormConfig(),
    obligation_assessment_result: getObligationAssessmentResultFormConfig(),
    obligation_internal_audit_result: getObligationAssessmentResultFormConfig(),
    obligation_second_line_result: getObligationAssessmentResultFormConfig(),
    document_assessment_result: getDocumentAssessmentResultFormConfig(),
    document_internal_audit_result: getDocumentAssessmentResultFormConfig(),
    document_second_line_result: getDocumentAssessmentResultFormConfig(),
    controlled_risk_assessment_result: getRiskAssessmentResultFormConfig(),
    uncontrolled_risk_assessment_result: getRiskAssessmentResultFormConfig(),
    risk_controlled_second_line_result: getRiskAssessmentResultFormConfig(),
    risk_uncontrolled_second_line_result: getRiskAssessmentResultFormConfig(),
    risk_controlled_internal_audit_result: getRiskAssessmentResultFormConfig(),
    risk_uncontrolled_internal_audit_result:
      getRiskAssessmentResultFormConfig(),
    third_party: getThirdPartyFormConfig(),
    assessment_activity: getAssessmentActivityFormConfig(),
    impact: getImpactFormConfig(),
    obligation: getObligationFormConfig(),
    control_group: getControlGroupFormConfig(),
    document_file: getDocumentFileFormConfig(),
    indicator_result: getIndicatorResultFormConfig(),
    document: getDocumentFormConfig(),
    issue_update: getIssueUpdateFormConfig(),
    action_update: getActionUpdateFormConfig(),
    acceptance: getAcceptanceFormConfig(),
    attestation_cycle: getAttestationCycleFormConfig(),
    appetite: getAppetiteFormConfig(enabledFeatures.includes('posture')),
    control_test_internal_audit_result: getTestResultFormConfig(),
    control_test_second_line_result: getTestResultFormConfig(),
    test_result: getTestResultFormConfig(),
    internal_audit_report: getAssessmentFormConfig(
      'internalAuditReports',
      'internal_audit_report_outcome'
    ),
    compliance_monitoring_assessment: getAssessmentFormConfig(
      'complianceMonitoringAssessment',
      'compliance_monitoring_assessment_outcome'
    ),
    assessment: getAssessmentFormConfig('assessments', 'assessment_outcome'),
    control: getControlFormConfig(),
    indicator: getIndicatorFormConfig(),
    risk: getRiskFormConfig(),
    consequence: getConsequenceFormConfig(),
    action: getActionFormConfig(),
    cause: getCauseFormConfig(),
    issue: getIssueFormConfig('issue'),
    issue_breach_log: getIssueFormConfig('issue_breach_log'),
    issue_consumer_duty: getIssueFormConfig('issue_consumer_duty'),
    issue_customer_trust: getIssueFormConfig('issue_customer_trust'),
    issue_gdpr_breach_log: getIssueFormConfig('issue_gdpr_breach_log'),
    issue_pci_breach_log: getIssueFormConfig('issue_pci_breach_log'),
    issue_risk_event: getIssueFormConfig('issue_risk_event'),
    issue_sar_log: getIssueFormConfig('issue_sar_log'),
    issue_assessment: getIssueAssessmentFormConfig('issue'),
    issue_assessment_breach_log:
      getIssueAssessmentFormConfig('issue_breach_log'),
    issue_assessment_consumer_duty: getIssueAssessmentFormConfig(
      'issue_consumer_duty'
    ),
    issue_assessment_customer_trust: getIssueAssessmentFormConfig(
      'issue_customer_trust'
    ),
    issue_assessment_gdpr_breach_log: getIssueAssessmentFormConfig(
      'issue_gdpr_breach_log'
    ),
    issue_assessment_pci_breach_log: getIssueAssessmentFormConfig(
      'issue_pci_breach_log'
    ),
    issue_assessment_risk_event:
      getIssueAssessmentFormConfig('issue_risk_event'),
    issue_assessment_sar_log: getIssueAssessmentFormConfig('issue_sar_log'),
  }) as const;

/**
 * Get the form registry instance. Whilst creating the formRegistry is not very resource intensive, it happens quite a lot,
 * so using a singleton pattern can help improve performance.
 */
export const getFormConfigRegistry = (enabledFeatures: OrgFeature[]) => {
  if (formRegistry) {
    return formRegistry;
  }
  formRegistry = createFormConfigRegistry(enabledFeatures);

  return formRegistry;
};

export type FormRegistry = ReturnType<typeof createFormConfigRegistry>;

export type FormId = keyof FormRegistry;

// Union of all valid column combinations across the registry.
export type FieldRegistryLookup = {
  [F in keyof FormRegistry]: {
    formId: F;
    fieldId: keyof FormRegistry[F];
  };
}[keyof FormRegistry];

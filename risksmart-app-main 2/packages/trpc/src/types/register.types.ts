import type {
  AcceptanceRegisterResponseRowWithChangeRequests,
  ActionRegisterResponseRow,
  AppetiteParentRegisterResponseRow,
  AssessmentActivityRegisterResponseRow,
  AssessmentRegisterResponseRow,
  AssessmentResultParentWithDocumentResultsResponseRow,
  AssessmentResultParentWithObligationResultsResponseRow,
  AttestationCycleRecordResponseRow,
  AttestationRecordResponseRow,
  CauseRegisterResponseRow,
  ConsequenceRegisterResponseRow,
  ControlGroupRegisterResponseRow,
  ControlRegisterResponseRow,
  DocumentRegisterResponseRow,
  EnterpriseRiskRegisterResponseRow,
  GetFormConfigurationResponseRow,
  IndicatorResponseRow,
  InternalAuditEntityRegisterResponseRow,
  InternalAuditReportRegisterResponseRow,
  IssueRegisterResponseRow,
  ObligationRegisterResponseRow,
  QuestionnaireTemplateRowWithVersions,
  QuestionnaireTemplateVersionById,
  RiskRegisterResponseRow,
  RiskScoreRow,
  ThirdPartyResponseRow,
} from './index';

export interface ControlRegisterResponse {
  control: ControlRegisterItem[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

export interface ControlRegisterItem extends ControlRegisterResponseRow {
  actionCount: number;
  issueCount: number;
  openIssueCount: number;
  indicatorCount: number;
}

// Control Group Register Types
export interface ControlGroupRegisterResponse {
  control_group: ControlGroupRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Risk Register Types
export interface RiskRegisterResponse {
  risk: RiskRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Enterprise Risk Register Types
export interface EnterpriseRiskRegisterResponse {
  enterprise_risk: EnterpriseRiskRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Document Register Types
export interface DocumentRegisterResponse {
  document: DocumentRegisterResponseRow[];
  assessment_result_parent: AssessmentResultParentWithDocumentResultsResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Issue Register Types
export interface IssueRegisterResponse {
  issue: IssueRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Action Register Types
export interface ActionRegisterResponse {
  action: ActionRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Cause Register Types
export interface CauseRegisterResponse {
  cause: CauseRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Consequence Register Types
export interface ConsequenceRegisterResponse {
  consequence: ConsequenceRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Third Party Register Types
export interface ThirdPartyRegisterResponse {
  third_party: ThirdPartyResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

export type RiskScoreRowWithLatestAssessments = RiskScoreRow & {
  inherent: RiskScoreRow['assessmentResults'];
  residual: RiskScoreRow['assessmentResults'];
};

export interface RiskScoreResponse {
  risk: RiskScoreRowWithLatestAssessments[];
}

export interface QuestionnaireTemplateRegisterResponse {
  questionnaire_template: QuestionnaireTemplateRowWithVersions[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

export interface QuestionnaireTemplateResponse {
  questionnaire_template:
    | QuestionnaireTemplateRowWithVersions
    | null
    | undefined;
}

export interface QuestionnaireTemplateVersionByIdResponse {
  questionnaire_template_version?:
    | QuestionnaireTemplateVersionById
    | null
    | undefined;
}

export interface QuestionnaireTemplateVersionByParentIdResponse {
  questionnaire_template_version: QuestionnaireTemplateVersionById[];
}

// Obligation Register Types
export interface ObligationRegisterResponse {
  obligation: ObligationRegisterResponseRow[];
  assessment_result_parent: AssessmentResultParentWithObligationResultsResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Assessment Register Types
export interface AssessmentRegisterResponse {
  assessment: AssessmentRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Assessment Register Types
export interface AssessmentActivityRegisterResponse {
  assessment_activity: AssessmentActivityRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Internal Audit Entity Register Types
export interface InternalAuditEntityRegisterResponse {
  internal_audit_entity: InternalAuditEntityRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Internal Audit Report Register Types
export interface InternalAuditReportRegisterResponse {
  internal_audit_report: InternalAuditReportRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Appetite Register Types
export interface AppetiteRegisterResponse {
  appetite_parent: AppetiteParentRegisterResponseRow[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Acceptance Register Types
export interface AcceptanceRegisterResponse {
  acceptance: AcceptanceRegisterResponseRowWithChangeRequests[];
  form_configuration?: GetFormConfigurationResponseRow | null | undefined;
}

// Attestation Register Types
export interface AttestationRegisterResponse {
  attestation_record: AttestationRecordResponseRow[];
}

export interface AttestationCycleRegisterResponse {
  attestation_cycle: AttestationCycleRecordResponseRow[];
}

// Indicator Register TypesAdd commentMore actions
export interface IndicatorRegisterResponse {
  indicators: IndicatorRegisterItem[];
  form_configuration?: GetFormConfigurationResponseRow;
}

export interface IndicatorRegisterItem extends IndicatorResponseRow {
  orderedResults: {
    TargetValueNum: number | null;
    TargetValueTxt: string | null;
    ResultDate: string;
  }[];
}

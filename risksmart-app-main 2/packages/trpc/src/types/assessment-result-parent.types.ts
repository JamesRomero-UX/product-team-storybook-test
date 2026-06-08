import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getAssessmentResultParentByIdQueryConfig,
  getAssessmentResultParentWithDocumentResultsQueryConfig,
  getAssessmentResultParentWithObligationResultsQueryConfig,
  getDocumentAssessmentResultsQueryConfig,
  getObligationAssessmentResultQueryConfig,
  getRiskAssessmentResultQueryConfig,
  getRiskAssessmentResultsByRiskIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/assessment-result.query';

export type AssessmentResultParentByIdResponseRow = InferQueryModel<
  'assessment_result_parent',
  typeof getAssessmentResultParentByIdQueryConfig
>;

export type AssessmentResultParentWithDocumentResultsResponseRow =
  InferQueryModel<
    'assessment_result_parent',
    typeof getAssessmentResultParentWithDocumentResultsQueryConfig
  >;

export type AssessmentResultParentWithObligationResultsResponseRow =
  InferQueryModel<
    'assessment_result_parent',
    typeof getAssessmentResultParentWithObligationResultsQueryConfig
  >;

export type DocumentAssessmentResultResponseRow = InferQueryModel<
  'document_assessment_result',
  typeof getDocumentAssessmentResultsQueryConfig
>;

export type ObligationAssessmentResultResponseRow = InferQueryModel<
  'obligation_assessment_result',
  typeof getObligationAssessmentResultQueryConfig
>;

export type RiskAssessmentResultResponseRow = InferQueryModel<
  'risk_assessment_result',
  typeof getRiskAssessmentResultQueryConfig
>;

export interface AssessmentResultsRegisterResponse {
  document_assessment_result: DocumentAssessmentResultResponseRow[];
  obligation_assessment_result: ObligationAssessmentResultResponseRow[];
  risk_assessment_result: RiskAssessmentResultResponseRow[];
}

export type RiskAssessmentResultsByRiskIdResponseRow = InferQueryModel<
  'risk_assessment_result',
  typeof getRiskAssessmentResultsByRiskIdQueryConfig
>;

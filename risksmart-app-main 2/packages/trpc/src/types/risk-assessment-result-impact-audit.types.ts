import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getRiskAssessmentResultImpactAuditByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/risk-assessment-result-impact-audit.query';

export type GetRiskAssessmentResultImpactAuditByIdResponseRow = InferQueryModel<
  'risk_assessment_result_impact_audit',
  typeof getRiskAssessmentResultImpactAuditByIdQueryConfig
>;

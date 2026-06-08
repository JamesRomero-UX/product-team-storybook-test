import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getRiskAssessmentResultConfigAuditByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/risk-assessment-result-config-audit.query';

export type GetRiskAssessmentResultConfigAuditByIdResponseRow = InferQueryModel<
  'risk_assessment_result_config_audit',
  typeof getRiskAssessmentResultConfigAuditByIdQueryConfig
>;

import type { QueryConfig } from '../db';
import { riskAssessmentResultImpactAudit } from './fragments/index';

export const getRiskAssessmentResultImpactAuditByIdQueryConfig = {
  ...riskAssessmentResultImpactAudit,
} as const satisfies QueryConfig<'risk_assessment_result_impact_audit'>;

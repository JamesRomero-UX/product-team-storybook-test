import type { QueryConfig } from '../../db';

export const riskAssessmentResultImpactAudit = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'risk_assessment_result_impact_audit'>;

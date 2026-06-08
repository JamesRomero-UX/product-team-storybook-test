import type { QueryConfig } from '../../db';

export const riskAssessmentResultConfigAudit = {
  columns: {
    OrgKey: false,
  },
} as const satisfies QueryConfig<'risk_assessment_result_config_audit'>;

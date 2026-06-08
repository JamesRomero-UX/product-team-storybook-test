import type { QueryConfig } from '../../db';

export const enterpriseRisk = {
  columns: {
    OrgKey: false,
    Meta: false,
  },
} as const satisfies QueryConfig<'enterprise_risk'>;

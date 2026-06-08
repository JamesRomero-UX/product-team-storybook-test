import type { QueryConfig } from '../db';

export const getAggregationSettingsForOrgQueryConfig = {
  columns: {
    RiskScoringModel: true,
    Appetite: true,
    Config: true,
  },
} as const satisfies QueryConfig<'aggregation_org'>;

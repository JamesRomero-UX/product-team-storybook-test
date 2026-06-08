import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getAggregationSettingsForOrgQueryConfig } from '@risksmart-app/drizzle/src/queries/aggregation.query';

export type AggregationSettingsForOrgResponseRow = InferQueryModel<
  'aggregation_org',
  typeof getAggregationSettingsForOrgQueryConfig
>;

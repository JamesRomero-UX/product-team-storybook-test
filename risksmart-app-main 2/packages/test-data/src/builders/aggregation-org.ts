import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildAggregationOrg = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'aggregation_org'>>;
}): InferInsertModel<'aggregation_org'> => ({
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedAtTimestamp: new Date().toISOString(),
  ...overrides,
});

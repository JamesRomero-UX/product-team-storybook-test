import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsIndicatorsQueryConfig } from '@risksmart-app/drizzle/src/queries/indicator.query';

export type GetMyDueItemsIndicatorsResponseRow = InferQueryModel<
  'indicator',
  typeof getMyDueItemsIndicatorsQueryConfig
>;

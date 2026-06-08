import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsObligationsQueryConfig } from '@risksmart-app/drizzle/src/queries/obligation.query';

export type GetMyDueItemsObligationsResponseRow = InferQueryModel<
  'obligation',
  typeof getMyDueItemsObligationsQueryConfig
>;

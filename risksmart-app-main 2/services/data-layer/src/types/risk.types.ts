import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsRisksQueryConfig } from '@risksmart-app/drizzle/src/queries/risk.query';

export type GetMyDueItemsRisksResponseRow = InferQueryModel<
  'risk',
  typeof getMyDueItemsRisksQueryConfig
>;

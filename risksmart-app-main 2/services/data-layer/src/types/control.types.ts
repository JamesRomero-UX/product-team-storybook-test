import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsControlsQueryConfig } from '@risksmart-app/drizzle/src/queries/control.query';

export type GetMyDueItemsControlsResponseRow = InferQueryModel<
  'control',
  typeof getMyDueItemsControlsQueryConfig
>;

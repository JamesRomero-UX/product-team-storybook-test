import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getLinkItemsListConfig } from '@risksmart-app/drizzle/src/queries/linked-item.query';

export type LinkedItemListResponseRow = InferQueryModel<
  'linked_item',
  typeof getLinkItemsListConfig
>;

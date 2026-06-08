import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getParentChildLinkedItemsQueryConfig } from '@risksmart-app/drizzle/src/queries/linked-item.query';

export type LinkedItemRow = InferQueryModel<
  'linked_item',
  typeof getParentChildLinkedItemsQueryConfig
>;

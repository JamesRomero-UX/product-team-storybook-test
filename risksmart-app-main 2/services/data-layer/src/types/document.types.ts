import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsDocumentQueryConfig } from '@risksmart-app/drizzle/src/queries/document.query';

export type GetMyDueItemsDocumentsResponseRow = InferQueryModel<
  'document',
  typeof getMyDueItemsDocumentQueryConfig
>;

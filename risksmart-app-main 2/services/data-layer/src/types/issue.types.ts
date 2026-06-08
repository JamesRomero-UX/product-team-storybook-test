import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getMyDueItemsIssuesQueryConfig } from '@risksmart-app/drizzle/src/queries/issue.query';

export type GetMyDueItemsIssuesResponseRow = InferQueryModel<
  'issue',
  typeof getMyDueItemsIssuesQueryConfig
>;

import type {
  InferQueryModel,
  InferSelectModel,
} from '@risksmart-app/drizzle/src/db';
import type {
  getIssueUpdateByIdQueryConfig,
  getIssueUpdatesByParentIssueIdQueryConfig,
} from '@risksmart-app/drizzle/src/queries/issue-update.query';

export type GetIssueUpdatesByParentIssueIdResponseRow = InferQueryModel<
  'issue_update',
  typeof getIssueUpdatesByParentIssueIdQueryConfig
>;

export type GetIssueUpdateByIdResponseRow = InferQueryModel<
  'issue_update',
  typeof getIssueUpdateByIdQueryConfig
>;

/**
 * Response from creating an issue update
 * The data-layer returns the full created entity
 */
export type CreateIssueUpdateResponse = InferSelectModel<'issue_update'>;

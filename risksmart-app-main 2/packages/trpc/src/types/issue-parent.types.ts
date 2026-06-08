import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIssueParentQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-parent.query';

export type IssueAssessmentParentResponseRow = InferQueryModel<
  'issue_parent',
  typeof getIssueParentQueryConfig
>;

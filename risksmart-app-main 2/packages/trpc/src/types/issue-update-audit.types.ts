import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type { getIssueUpdateAuditByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/issue-update-audit.query';

export type GetIssueUpdateAuditByIdResponseRow = InferQueryModel<
  'issue_update_audit',
  typeof getIssueUpdateAuditByIdQueryConfig
>;

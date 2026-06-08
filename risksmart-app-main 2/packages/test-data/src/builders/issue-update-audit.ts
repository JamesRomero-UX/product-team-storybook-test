import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildIssueUpdateAudit = ({
  orgKey,
  userId,
  issueId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  issueId: string;
  overrides?: Partial<InferInsertModel<'issue_update_audit'>>;
}): InferInsertModel<'issue_update_audit'> => ({
  Id: randomUUID(),
  Title: 'Some issue update audit title',
  Description: 'Some issue update audit description',
  ParentIssueId: issueId,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  Action: 'INSERT',
  CustomAttributeData: null,
  ...overrides,
});

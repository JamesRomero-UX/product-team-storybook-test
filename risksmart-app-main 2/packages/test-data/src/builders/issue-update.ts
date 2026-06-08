import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildIssueUpdate = ({
  orgKey,
  userId,
  issueId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  issueId: string;
  overrides?: Partial<InferInsertModel<'issue_update'>>;
}): InferInsertModel<'issue_update'> => ({
  Description: 'Some issue update description',
  Title: 'Some title',
  CreatedAtTimestamp: undefined,
  ModifiedAtTimestamp: undefined,
  Id: randomUUID(),
  ParentIssueId: issueId,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  OrgKey: orgKey,
  ...overrides,
});

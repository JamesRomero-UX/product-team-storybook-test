import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';

export const buildIssueParent = ({
  orgkey,
  userId,
  issueId,
  parentId,
  overrides,
}: {
  orgkey: string;
  userId: string;
  issueId: string;
  parentId: string;
  overrides?: Partial<InferInsertModel<'issue_parent'>>;
}): InferInsertModel<'issue_parent'> => ({
  IssueId: issueId,
  ParentId: parentId,
  OrgKey: orgkey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  ParentType: ParentTypes.Issue,
  ...overrides,
});

import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildCause = ({
  orgKey,
  userId,
  parentIssueId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  parentIssueId: string;
  overrides?: Partial<InferInsertModel<'cause'>>;
}): InferInsertModel<'cause'> => ({
  Id: randomUUID(),
  Title: 'Test Cause',
  Description: 'Test cause description',
  Significance: null,
  ParentIssueId: parentIssueId,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: undefined,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: undefined,
  Meta: null,
  CustomAttributeData: null,
  ...overrides,
});

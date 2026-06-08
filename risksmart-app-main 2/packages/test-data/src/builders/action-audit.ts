import { ActionStatus } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildActionAudit = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'action_audit'>>;
}): InferInsertModel<'action_audit'> => ({
  Id: randomUUID(),
  Title: 'Test Action Audit',
  DateRaised: new Date().toISOString(),
  DateDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  Status: ActionStatus.Open,
  Priority: 1,
  Description: 'Test action audit description',
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  Action: 'INSERT',
  ClosedDate: null,
  CustomAttributeData: null,
  Meta: null,
  ...overrides,
});

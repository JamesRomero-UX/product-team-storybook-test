import { ActionStatus } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildAction = (
  orgkey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'action'>>
): InferInsertModel<'action'> => ({
  Id: randomUUID(),
  Title: 'Test Action',
  DateRaised: '2024-01-15T10:00:00Z',
  DateDue: '2024-01-16T10:00:00Z',
  ModifiedAtTimestamp: '2024-01-15T10:00:00Z',
  ModifiedByUser: userId,
  Status: ActionStatus.Open,
  OrgKey: orgkey,
  Priority: 1,
  CreatedByUser: userId,
  CreatedAtTimestamp: '2024-01-15T10:00:00Z',
  Meta: {},
  Description: '',
  ClosedDate: '2024-01-15T10:00:00Z',
  CustomAttributeData: {},
  ...overrides,
});

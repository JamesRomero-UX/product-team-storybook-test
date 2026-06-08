import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildAcceptance = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'acceptance'>>;
}): Omit<InferInsertModel<'acceptance'>, 'SequentialId'> => ({
  Id: randomUUID(),
  Title: 'Test Acceptance',
  DateAcceptedFrom: new Date().toISOString(),
  DateAcceptedTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  Details: 'Test acceptance details',
  Status: AcceptanceStatus.Open,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: undefined,
  ModifiedByUser: userId,
  ModifiedAtTimestamp: undefined,
  Meta: null,
  ApprovedByUser: null,
  ApprovedByUserGroup: null,
  RequestedByUser: null,
  RequestedByUserGroup: null,
  CustomAttributeData: null,
  ...overrides,
});

import { AcceptanceStatus } from '@risksmart-app/domain/src/types/consts/acceptance-status';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildAcceptanceAudit = ({
  orgKey,
  userId,
  overrides,
}: {
  orgKey: string;
  userId: string;
  overrides?: Partial<InferInsertModel<'acceptance_audit'>>;
}): InferInsertModel<'acceptance_audit'> => ({
  Id: randomUUID(),
  Title: 'Test Acceptance Audit',
  DateAcceptedFrom: new Date().toISOString(),
  DateAcceptedTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  Details: 'Test acceptance audit details',
  Status: AcceptanceStatus.Open,
  OrgKey: orgKey,
  CreatedByUser: userId,
  CreatedAtTimestamp: new Date().toISOString(),
  ModifiedByUser: userId,
  ModifiedAtTimestamp: new Date().toISOString(),
  Action: 'INSERT',
  ApprovedByUser: null,
  ApprovedByUserGroup: null,
  RequestedByUser: null,
  RequestedByUserGroup: null,
  CustomAttributeData: null,
  ...overrides,
});

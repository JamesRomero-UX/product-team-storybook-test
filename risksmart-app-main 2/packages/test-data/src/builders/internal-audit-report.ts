import { InternalAuditStatus } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildInternalAuditReport = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'internal_audit_report'>>
): Omit<InferInsertModel<'internal_audit_report'>, 'SequentialId'> => ({
  Id: randomUUID(),
  Title: 'Test Internal Audit Report',
  Summary: 'Test audit report summary',
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  Status: InternalAuditStatus.NotStarted,
  ...overrides,
});

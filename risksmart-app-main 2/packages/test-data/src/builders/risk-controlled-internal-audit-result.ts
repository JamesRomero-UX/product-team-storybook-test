import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildRiskControlledInternalAuditResult = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'risk_controlled_internal_audit_result'>>
): InferInsertModel<'risk_controlled_internal_audit_result'> => ({
  Id: randomUUID(),
  TestDate: '2024-01-15T10:00:00Z',
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  Rating: 2,
  ...overrides,
});

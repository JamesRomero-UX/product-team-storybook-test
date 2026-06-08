import { ParentTypes } from '@risksmart-app/domain/src/types/consts';
import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { randomUUID } from 'crypto';

export const buildInternalAuditResultParent = (
  orgKey: string,
  userId: string,
  overrides?: Partial<InferInsertModel<'internal_audit_result_parent'>>
): InferInsertModel<'internal_audit_result_parent'> => ({
  Id: randomUUID(),
  ParentId: randomUUID(),
  ResultType: ParentTypes.DocumentInternalAuditResult,
  ParentType: ParentTypes.InternalAuditReport,
  OrgKey: orgKey,
  CreatedByUser: userId,
  ModifiedByUser: userId,
  ...overrides,
});

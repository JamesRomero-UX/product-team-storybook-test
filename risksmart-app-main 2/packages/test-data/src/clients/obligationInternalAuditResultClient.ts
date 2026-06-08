import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { obligation_internal_audit_result } from '@risksmart-app/drizzle/src/schema';

export const insertObligationInternalAuditResult = async (
  input: InferInsertModel<'obligation_internal_audit_result'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(obligation_internal_audit_result).values(input);
};

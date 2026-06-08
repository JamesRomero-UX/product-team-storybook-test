import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { internal_audit_result_parent } from '@risksmart-app/drizzle/src/schema';

export const insertInternalAuditResultParent = async (
  input: InferInsertModel<'internal_audit_result_parent'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(internal_audit_result_parent).values(input);
};

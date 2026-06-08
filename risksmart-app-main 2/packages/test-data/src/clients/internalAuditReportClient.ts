import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { internal_audit_report } from '@risksmart-app/drizzle/src/schema';

export const insertInternalAuditReport = async (
  input: Omit<InferInsertModel<'internal_audit_report'>, 'SequentialId'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin
    .insert(internal_audit_report)
    .values(input as InferInsertModel<'internal_audit_report'>);
};

import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { document_internal_audit_result } from '@risksmart-app/drizzle/src/schema';

export const insertDocumentInternalAuditResult = async (
  input: InferInsertModel<'document_internal_audit_result'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(document_internal_audit_result).values(input);
};

import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { control_test_internal_audit_result } from '@risksmart-app/drizzle/src/schema';

export const insertControlTestInternalAuditResult = async (
  input: Omit<
    InferInsertModel<'control_test_internal_audit_result'>,
    'SequentialId'
  >
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin
    .insert(control_test_internal_audit_result)
    .values(input as InferInsertModel<'control_test_internal_audit_result'>);
};

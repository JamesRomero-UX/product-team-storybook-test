import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { risk_controlled_internal_audit_result } from '@risksmart-app/drizzle/src/schema';

export const insertRiskControlledInternalAuditResult = async (
  input: InferInsertModel<'risk_controlled_internal_audit_result'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(risk_controlled_internal_audit_result).values(input);
};

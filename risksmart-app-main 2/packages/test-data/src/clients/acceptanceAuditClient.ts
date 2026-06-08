import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { acceptance_audit } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertAcceptanceAudit = async (
  input: InferInsertModel<'acceptance_audit'>
) => {
  const db = await getSharedDb();
  await db.admin.insert(acceptance_audit).values(input);
};

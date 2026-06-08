import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { action_audit } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertActionAudit = async (
  input: InferInsertModel<'action_audit'>
) => {
  const db = await getSharedDb();
  await db.admin.insert(action_audit).values(input);
};

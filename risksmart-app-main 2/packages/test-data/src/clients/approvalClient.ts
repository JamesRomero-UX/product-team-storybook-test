import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { approval } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertApproval = async (input: InferInsertModel<'approval'>) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin.insert(approval).values(input).returning();

  return inserted;
};

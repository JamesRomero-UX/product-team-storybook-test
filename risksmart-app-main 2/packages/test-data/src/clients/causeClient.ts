import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { cause } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertCause = async (input: InferInsertModel<'cause'>) => {
  const db = await getSharedDb();

  const [insertedCause] = await db.admin
    .insert(cause)
    .values(input)
    .returning();

  return insertedCause;
};

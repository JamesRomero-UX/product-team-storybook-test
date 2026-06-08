import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { user } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertUser = async (input: InferInsertModel<'user'>) => {
  const db = await getSharedDb();

  const [insertedUser] = await db.admin.insert(user).values(input).returning();

  return insertedUser;
};

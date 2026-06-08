import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { owner } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertOwner = async (input: InferInsertModel<'owner'>) => {
  const db = await getSharedDb();

  const [insertedOwner] = await db.admin
    .insert(owner)
    .values(input)
    .returning();

  return insertedOwner;
};

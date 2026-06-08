import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { consequence } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertConsequence = async (
  input: InferInsertModel<'consequence'>
) => {
  const db = await getSharedDb();

  const [insertedConsequence] = await db.admin
    .insert(consequence)
    .values(input)
    .returning();

  return insertedConsequence;
};

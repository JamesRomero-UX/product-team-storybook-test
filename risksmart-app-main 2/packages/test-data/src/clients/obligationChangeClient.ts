import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { obligation_change } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertObligationChange = async (
  input: Omit<InferInsertModel<'obligation_change'>, 'SequentialId'>
) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin
    .insert(obligation_change)
    .values(input)
    .returning();

  return inserted;
};

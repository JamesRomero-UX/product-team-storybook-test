import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { acceptance } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertAcceptance = async (
  input: Omit<InferInsertModel<'acceptance'>, 'SequentialId'>
) => {
  const db = await getSharedDb();
  const [insertedAcceptance] = await db.admin
    .insert(acceptance)
    .values(input as InferInsertModel<'acceptance'>)
    .returning();

  return insertedAcceptance;
};

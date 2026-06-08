import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { business_area } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertBusinessArea = async (
  input: Omit<InferInsertModel<'business_area'>, 'SequentialId'>
) => {
  const db = await getSharedDb();

  const [insertedBusinessArea] = await db.admin
    .insert(business_area)
    .values(input as InferInsertModel<'business_area'>)
    .returning();

  return insertedBusinessArea;
};

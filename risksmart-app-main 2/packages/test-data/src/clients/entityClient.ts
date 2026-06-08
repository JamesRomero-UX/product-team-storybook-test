import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { entity } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertEntity = async (input: InferInsertModel<'entity'>) => {
  const db = await getSharedDb();

  const [insertedEntity] = await db.admin
    .insert(entity)
    .values(input)
    .returning();

  return insertedEntity;
};

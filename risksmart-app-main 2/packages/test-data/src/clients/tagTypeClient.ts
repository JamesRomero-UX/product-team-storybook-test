import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { tag_type } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertTagType = async (input: InferInsertModel<'tag_type'>) => {
  const db = await getSharedDb();

  const [insertedTagType] = await db.admin
    .insert(tag_type)
    .values(input)
    .returning();

  return insertedTagType;
};

export const insertTagTypes = async (
  inputs: InferInsertModel<'tag_type'>[]
) => {
  const db = await getSharedDb();

  const insertedTagTypes = await db.admin
    .insert(tag_type)
    .values(inputs)
    .returning();

  return insertedTagTypes;
};

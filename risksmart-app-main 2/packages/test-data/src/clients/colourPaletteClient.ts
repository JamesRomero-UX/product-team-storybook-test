import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { colour_palette } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertColourPalette = async (
  input: InferInsertModel<'colour_palette'>
) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin
    .insert(colour_palette)
    .values(input)
    .returning();

  return inserted;
};

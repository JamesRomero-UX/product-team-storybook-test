import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { third_party } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertThirdParty = async (
  input: InferInsertModel<'third_party'>
) => {
  const db = await getSharedDb();

  const [insertedThirdParty] = await db.admin
    .insert(third_party)
    .values(input)
    .returning();

  return insertedThirdParty;
};

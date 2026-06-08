import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { organisation } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertOrganisation = async (
  input: InferInsertModel<'organisation'>
) => {
  const db = await getSharedDb();
  await db.admin.insert(organisation).values(input);
};

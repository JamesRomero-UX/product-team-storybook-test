import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { appetite_parent } from '@risksmart-app/drizzle/src/schema';

export const insertAppetiteParent = async (
  input: InferInsertModel<'appetite_parent'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [insertedAppetiteParent] = await db.admin
    .insert(appetite_parent)
    .values(input)
    .returning();

  return insertedAppetiteParent;
};

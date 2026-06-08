import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { appetite } from '@risksmart-app/drizzle/src/schema';

export const insertAppetite = async (
  input: Omit<InferInsertModel<'appetite'>, 'SequentialId'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [insertedAppetite] = await db.admin
    .insert(appetite)
    .values(input as InferInsertModel<'appetite'>)
    .returning();

  return insertedAppetite;
};

import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { action_update } from '@risksmart-app/drizzle/src/schema';

export const insertActionUpdate = async (
  input: InferInsertModel<'action_update'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [insertedActionUpdate] = await db.admin
    .insert(action_update)
    .values(input)
    .returning();

  return insertedActionUpdate;
};

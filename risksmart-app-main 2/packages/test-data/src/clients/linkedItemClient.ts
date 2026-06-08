import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { linked_item } from '@risksmart-app/drizzle/src/schema';

export const insertLinkedItem = async (
  input: InferInsertModel<'linked_item'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedLinkedItem] = await db.admin
    .insert(linked_item)
    .values(input)
    .returning();

  return insertedLinkedItem;
};

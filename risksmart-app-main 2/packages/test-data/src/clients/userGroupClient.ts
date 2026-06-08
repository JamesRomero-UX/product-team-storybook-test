import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { user_group } from '@risksmart-app/drizzle/src/schema';
import { eq } from 'drizzle-orm';

export const insertUserGroup = async (
  input: InferInsertModel<'user_group'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedUserGroup] = await db.admin
    .insert(user_group)
    .values(input)
    .returning();

  return insertedUserGroup;
};

export const getUserGroupById = async (id: string) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const userGroup = await db.admin
    .select()
    .from(user_group)
    .where(eq(user_group.Id, id))
    .limit(1);

  return userGroup[0];
};

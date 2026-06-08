import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { user_group_user } from '@risksmart-app/drizzle/src/schema';

export const insertUserGroupUser = async (
  input: InferInsertModel<'user_group_user'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedUserGroupUser] = await db.admin
    .insert(user_group_user)
    .values(input)
    .returning();

  return insertedUserGroupUser;
};

export const insertUserGroupUsers = async (
  inputs: InferInsertModel<'user_group_user'>[]
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const insertedUserGroupUsers = await db.admin
    .insert(user_group_user)
    .values(inputs)
    .returning();

  return insertedUserGroupUsers;
};

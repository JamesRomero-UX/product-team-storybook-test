import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { change_request } from '@risksmart-app/drizzle/src/schema';

export const insertChangeRequest = async (
  input: InferInsertModel<'change_request'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedChangeRequest] = await db.admin
    .insert(change_request)
    .values(input)
    .returning();

  return insertedChangeRequest;
};

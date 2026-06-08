import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { change_request_contributor } from '@risksmart-app/drizzle/src/schema';

export const insertChangeRequestContributor = async (
  input: InferInsertModel<'change_request_contributor'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedContributor] = await db.admin
    .insert(change_request_contributor)
    .values(input)
    .returning();

  return insertedContributor;
};

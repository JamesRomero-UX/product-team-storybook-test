import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { organisationuser } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertOrganisationUser = async (
  input: InferInsertModel<'organisationuser'>
) => {
  const db = await getSharedDb();

  const [insertedOrganisationUser] = await db.admin
    .insert(organisationuser)
    .values(input)
    .returning();

  return insertedOrganisationUser;
};

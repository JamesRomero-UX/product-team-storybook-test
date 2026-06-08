import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { organisation_module } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertOrganisationModule = async (
  input: InferInsertModel<'organisation_module'>
) => {
  const db = await getSharedDb();

  const [insertedOrganisationModule] = await db.admin
    .insert(organisation_module)
    .values(input)
    .returning();

  return insertedOrganisationModule;
};

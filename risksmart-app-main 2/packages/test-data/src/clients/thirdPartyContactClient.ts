import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { third_party_contact } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertThirdPartyContact = async (
  input: InferInsertModel<'third_party_contact'>
) => {
  const db = await getSharedDb();

  const [insertedContact] = await db.admin
    .insert(third_party_contact)
    .values(input)
    .returning();

  return insertedContact;
};

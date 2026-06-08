import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { obligation } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertObligation = async (
  input: InferInsertModel<'obligation'>
) => {
  const db = await getSharedDb();

  const [insertedObligation] = await db.admin
    .insert(obligation)
    .values(input)
    .returning();

  return insertedObligation;
};

export const insertObligations = async (
  inputs: InferInsertModel<'obligation'>[]
) => {
  const db = await getSharedDb();

  const insertedObligations = await db.admin
    .insert(obligation)
    .values(inputs)
    .returning();

  return insertedObligations;
};

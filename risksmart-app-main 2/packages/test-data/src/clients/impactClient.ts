import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { impact } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertImpact = async (
  input: Omit<InferInsertModel<'impact'>, 'SequentialId'>
) => {
  const db = await getSharedDb();
  const [insertedImpact] = await db.admin
    .insert(impact)
    .values(input as InferInsertModel<'impact'>)
    .returning();

  return insertedImpact;
};

export const insertImpacts = async (
  inputs: Omit<InferInsertModel<'impact'>, 'SequentialId'>[]
) => {
  const db = await getSharedDb();
  const insertedImpacts = await db.admin
    .insert(impact)
    .values(inputs as InferInsertModel<'impact'>[])
    .returning();

  return insertedImpacts;
};

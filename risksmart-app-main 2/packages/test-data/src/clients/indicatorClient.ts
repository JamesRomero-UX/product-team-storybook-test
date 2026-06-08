import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { indicator } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertIndicator = async (input: InferInsertModel<'indicator'>) => {
  const db = await getSharedDb();

  const [insertedIndicator] = await db.admin
    .insert(indicator)
    .values(input)
    .returning();

  return insertedIndicator;
};

export const insertIndicators = async (
  inputs: InferInsertModel<'indicator'>[]
) => {
  const db = await getSharedDb();

  const insertedIndicators = await db.admin
    .insert(indicator)
    .values(inputs)
    .returning();

  return insertedIndicators;
};

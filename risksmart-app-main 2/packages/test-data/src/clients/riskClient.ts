import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { risk } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertRisk = async (input: InferInsertModel<'risk'>) => {
  const db = await getSharedDb();
  const [insertedRisk] = await db.admin.insert(risk).values(input).returning();

  return insertedRisk;
};

export const insertRisks = async (inputs: InferInsertModel<'risk'>[]) => {
  const db = await getSharedDb();
  const insertedRisks = await db.admin.insert(risk).values(inputs).returning();

  return insertedRisks;
};

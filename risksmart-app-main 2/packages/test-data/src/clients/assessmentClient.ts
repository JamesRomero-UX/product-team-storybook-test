import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { assessment } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertAssessment = async (
  input: InferInsertModel<'assessment'>
) => {
  const db = await getSharedDb();

  const [insertedAssessment] = await db.admin
    .insert(assessment)
    .values(input)
    .returning();

  return insertedAssessment;
};

export const insertAssessments = async (
  inputs: InferInsertModel<'assessment'>[]
) => {
  const db = await getSharedDb();

  const insertedAssessments = await db.admin
    .insert(assessment)
    .values(inputs)
    .returning();

  return insertedAssessments;
};

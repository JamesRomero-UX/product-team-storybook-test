import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { issue } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertIssue = async (input: InferInsertModel<'issue'>) => {
  const db = await getSharedDb();

  const [insertedIssue] = await db.admin
    .insert(issue)
    .values(input)
    .returning();

  return insertedIssue;
};

export const insertIssues = async (inputs: InferInsertModel<'issue'>[]) => {
  const db = await getSharedDb();

  const insertedIssues = await db.admin
    .insert(issue)
    .values(inputs)
    .returning();

  return insertedIssues;
};

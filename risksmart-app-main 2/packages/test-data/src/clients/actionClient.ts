import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { action } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertAction = async (input: InferInsertModel<'action'>) => {
  const db = await getSharedDb();
  const [insertedAction] = await db.admin
    .insert(action)
    .values(input)
    .returning();

  return insertedAction;
};

export const insertActions = async (inputs: InferInsertModel<'action'>[]) => {
  const db = await getSharedDb();
  const insertedActions = await db.admin
    .insert(action)
    .values(inputs)
    .returning();

  return insertedActions;
};

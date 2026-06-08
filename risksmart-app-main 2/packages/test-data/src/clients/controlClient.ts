import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { control } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertControl = async (
  input: Omit<InferInsertModel<'control'>, 'SequentialId'>
) => {
  const db = await getSharedDb();

  const [insertedControl] = await db.admin
    .insert(control)
    .values(input as InferInsertModel<'control'>)
    .returning();

  return insertedControl;
};

export const insertControls = async (
  inputs: Omit<InferInsertModel<'control'>, 'SequentialId'>[]
) => {
  const db = await getSharedDb();

  const insertedControls = await db.admin
    .insert(control)
    .values(inputs as InferInsertModel<'control'>[])
    .returning();

  return insertedControls;
};

import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { department_type } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertDepartmentType = async (
  input: InferInsertModel<'department_type'>
) => {
  const db = await getSharedDb();

  const [insertedDepartmentType] = await db.admin
    .insert(department_type)
    .values(input)
    .returning();

  return insertedDepartmentType;
};

export const insertDepartmentTypes = async (
  inputs: InferInsertModel<'department_type'>[]
) => {
  const db = await getSharedDb();

  const insertedDepartmentTypes = await db.admin
    .insert(department_type)
    .values(inputs)
    .returning();

  return insertedDepartmentTypes;
};

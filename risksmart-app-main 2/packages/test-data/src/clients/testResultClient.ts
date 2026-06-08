import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { test_result } from '@risksmart-app/drizzle/src/schema';

export const insertTestResult = async (
  input: Omit<InferInsertModel<'test_result'>, 'SequentialId'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedTestResult] = await db.admin
    .insert(test_result)
    .values(input as InferInsertModel<'test_result'>)
    .returning();

  return insertedTestResult;
};

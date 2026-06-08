import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { indicator_result } from '@risksmart-app/drizzle/src/schema';

export const insertIndicatorResult = async (
  input: InferInsertModel<'indicator_result'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedIndicatorResult] = await db.admin
    .insert(indicator_result)
    .values(input)
    .returning();

  return insertedIndicatorResult;
};

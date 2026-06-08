import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { second_line_result_parent } from '@risksmart-app/drizzle/src/schema';

export const insertSecondLineResultParent = async (
  input: InferInsertModel<'second_line_result_parent'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(second_line_result_parent).values(input);
};

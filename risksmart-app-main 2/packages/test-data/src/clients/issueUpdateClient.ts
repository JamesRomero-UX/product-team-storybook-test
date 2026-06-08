import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { issue_update } from '@risksmart-app/drizzle/src/schema';

export const insertIssueUpdate = async (
  input: InferInsertModel<'issue_update'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [insertedIssueUpdate] = await db.admin
    .insert(issue_update)
    .values(input)
    .returning();

  return insertedIssueUpdate;
};

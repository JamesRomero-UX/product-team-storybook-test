import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { issue_parent } from '@risksmart-app/drizzle/src/schema';

export const insertIssueParent = async (
  input: InferInsertModel<'issue_parent'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(issue_parent).values(input);
};

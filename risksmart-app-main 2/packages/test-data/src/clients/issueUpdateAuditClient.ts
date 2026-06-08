import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { issue_update_audit } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertIssueUpdateAudit = async (
  input: InferInsertModel<'issue_update_audit'>
) => {
  const db = await getSharedDb();
  await db.admin.insert(issue_update_audit).values(input);
};

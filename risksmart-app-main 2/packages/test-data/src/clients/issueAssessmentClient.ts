import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { issue_assessment } from '@risksmart-app/drizzle/src/schema';

export const insertIssueAssessment = async (
  input: InferInsertModel<'issue_assessment'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(issue_assessment).values(input);
};

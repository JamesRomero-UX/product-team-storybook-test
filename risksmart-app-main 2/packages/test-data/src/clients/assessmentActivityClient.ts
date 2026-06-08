import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { assessment_activity } from '@risksmart-app/drizzle/src/schema';

export const insertAssessmentActivity = async (
  input: InferInsertModel<'assessment_activity'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(assessment_activity).values(input);
};

import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { assessment_result_parent } from '@risksmart-app/drizzle/src/schema';

export const insertAssessmentResultParent = async (
  assessmentResultParent: InferInsertModel<'assessment_result_parent'>
) => {
  const db = await createDrizzleClient({
    tenant: 'testing',
    orgId: assessmentResultParent.OrgKey,
    userId: assessmentResultParent.CreatedByUser,
  });

  const [insertedAssessmentResultParent] = await db.admin
    .insert(assessment_result_parent)
    .values(assessmentResultParent)
    .returning();

  return insertedAssessmentResultParent;
};

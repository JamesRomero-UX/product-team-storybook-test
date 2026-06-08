import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { obligation_assessment_result } from '@risksmart-app/drizzle/src/schema';

export const insertObligationAssessmentResult = async (
  obligationAssessmentResult: InferInsertModel<'obligation_assessment_result'>
) => {
  const db = await createDrizzleClient({
    tenant: 'testing',
    orgId: obligationAssessmentResult.OrgKey,
    userId: obligationAssessmentResult.CreatedByUser,
  });

  const [insertedObligationResultId] = await db.org((tx) => {
    return tx
      .insert(obligation_assessment_result)
      .values(obligationAssessmentResult)
      .returning();
  });

  return insertedObligationResultId;
};

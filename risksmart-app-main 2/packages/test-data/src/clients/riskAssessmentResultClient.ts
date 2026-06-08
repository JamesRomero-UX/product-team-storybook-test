import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { risk_assessment_result } from '@risksmart-app/drizzle/src/schema';

export const insertRiskAssessmentResult = async (
  riskAssessmentResult: InferInsertModel<'risk_assessment_result'>
) => {
  const db = await createDrizzleClient({
    tenant: 'testing',
    orgId: riskAssessmentResult.OrgKey,
    userId: riskAssessmentResult.CreatedByUser,
  });

  const [insertedRiskResult] = await db.org((tx) => {
    return tx
      .insert(risk_assessment_result)
      .values(riskAssessmentResult)
      .returning();
  });

  return insertedRiskResult;
};

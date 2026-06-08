import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { risk_assessment_result_config } from '@risksmart-app/drizzle/src/schema';

export const insertRiskAssessmentResultConfig = async (
  input: InferInsertModel<'risk_assessment_result_config'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [result] = await db.admin
    .insert(risk_assessment_result_config)
    .values(input)
    .returning();

  return result;
};

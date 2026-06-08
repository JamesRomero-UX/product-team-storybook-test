import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { risk_assessment_result_impact_audit } from '@risksmart-app/drizzle/src/schema';

export const insertRiskAssessmentResultImpactAudit = async (
  input: InferInsertModel<'risk_assessment_result_impact_audit'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(risk_assessment_result_impact_audit).values(input);
};

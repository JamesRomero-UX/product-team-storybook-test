import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { risk_assessment_result_config_audit } from '@risksmart-app/drizzle/src/schema';

export const insertRiskAssessmentResultConfigAudit = async (
  input: InferInsertModel<'risk_assessment_result_config_audit'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(risk_assessment_result_config_audit).values(input);
};

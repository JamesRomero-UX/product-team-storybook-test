import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { compliance_monitoring_assessment } from '@risksmart-app/drizzle/src/schema';

export const insertComplianceMonitoringAssessment = async (
  input: Omit<
    InferInsertModel<'compliance_monitoring_assessment'>,
    'SequentialId'
  >
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin
    .insert(compliance_monitoring_assessment)
    .values(input as InferInsertModel<'compliance_monitoring_assessment'>);
};

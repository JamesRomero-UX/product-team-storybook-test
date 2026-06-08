import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { enterprise_risk } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertEnterpriseRisk = async (
  input: Omit<InferInsertModel<'enterprise_risk'>, 'SequentialId'>
) => {
  const db = await getSharedDb();
  const [inserted] = await db.admin
    .insert(enterprise_risk)
    .values(input as InferInsertModel<'enterprise_risk'>)
    .returning();

  return inserted;
};

export const insertEnterpriseRisks = async (
  inputs: Omit<InferInsertModel<'enterprise_risk'>, 'SequentialId'>[]
) => {
  const db = await getSharedDb();
  const inserted = await db.admin
    .insert(enterprise_risk)
    .values(inputs as InferInsertModel<'enterprise_risk'>[])
    .returning();

  return inserted;
};

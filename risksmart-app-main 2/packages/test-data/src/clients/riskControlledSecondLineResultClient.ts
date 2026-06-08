import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { risk_controlled_second_line_result } from '@risksmart-app/drizzle/src/schema';

export const insertRiskControlledSecondLineResult = async (
  input: InferInsertModel<'risk_controlled_second_line_result'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(risk_controlled_second_line_result).values(input);
};

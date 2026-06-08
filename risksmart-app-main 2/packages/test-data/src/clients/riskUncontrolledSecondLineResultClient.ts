import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { risk_uncontrolled_second_line_result } from '@risksmart-app/drizzle/src/schema';

export const insertRiskUncontrolledSecondLineResult = async (
  input: InferInsertModel<'risk_uncontrolled_second_line_result'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  await db.admin.insert(risk_uncontrolled_second_line_result).values(input);
};

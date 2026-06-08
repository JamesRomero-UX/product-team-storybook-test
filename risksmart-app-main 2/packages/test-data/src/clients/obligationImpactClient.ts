import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { obligation_impact } from '@risksmart-app/drizzle/src/schema';

export const insertObligationImpact = async (
  input: InferInsertModel<'obligation_impact'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedObligationImpact] = await db.admin
    .insert(obligation_impact)
    .values(input)
    .returning();

  return insertedObligationImpact;
};

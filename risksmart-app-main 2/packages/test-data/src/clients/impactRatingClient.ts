import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { impact_rating } from '@risksmart-app/drizzle/src/schema';

export const insertImpactRating = async (
  input: Omit<InferInsertModel<'impact_rating'>, 'SequentialId'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });
  const [insertedImpactRating] = await db.admin
    .insert(impact_rating)
    .values(input as InferInsertModel<'impact_rating'>)
    .returning();

  return insertedImpactRating;
};

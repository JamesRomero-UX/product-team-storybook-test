import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { aggregation_org } from '@risksmart-app/drizzle/src/schema';

import { getSharedDb } from './shared-db';

export const insertAggregationOrg = async (
  input: InferInsertModel<'aggregation_org'>
) => {
  const db = await getSharedDb();

  const [inserted] = await db.admin
    .insert(aggregation_org)
    .values(input)
    .returning();

  return inserted;
};

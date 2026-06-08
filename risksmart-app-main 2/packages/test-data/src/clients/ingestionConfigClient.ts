import type { InferInsertModel } from '@risksmart-app/drizzle/src/db';
import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';
import { ingestion_config } from '@risksmart-app/drizzle/src/schema';

export const insertIngestionConfig = async (
  input: InferInsertModel<'ingestion_config'>
) => {
  const db = await createDrizzleClient({ orgId: '', tenant: '', userId: '' });

  const [insertedIngestionConfig] = await db.admin
    .insert(ingestion_config)
    .values(input)
    .returning();

  return insertedIngestionConfig;
};

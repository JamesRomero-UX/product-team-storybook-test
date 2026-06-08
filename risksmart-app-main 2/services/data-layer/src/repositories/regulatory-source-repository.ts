import type { DB } from '@risksmart-app/drizzle/src/db';
import { regulatory_source } from '@risksmart-app/drizzle/src/schema';
import { sql } from 'drizzle-orm';

import { getLogger } from '../utils/logger';

const logger = getLogger();

export function createRegulatorySourceRepository(db: DB['transaction']) {
  const upsertRegulatorySource = async (
    values: (typeof regulatory_source.$inferInsert)[]
  ): Promise<(typeof regulatory_source.$inferSelect)[]> => {
    try {
      // this might not be very desirable as it means that the modified timestamp will be updated
      // every time there is an ingestion run, even if nothing has actually changed.
      // however the alternative is to do a select before the upsert to check if anything has changed,
      // which would be more expensive in terms of db calls and latency.
      return await db(
        async (tx) =>
          await tx
            .insert(regulatory_source)
            .values(values)
            .onConflictDoUpdate({
              target: [
                regulatory_source.OrgKey,
                regulatory_source.ExternalRegulatorId,
                regulatory_source.ProviderName,
              ],
              set: {
                RegulatorName: sql`EXCLUDED."RegulatorName"`,
                ModifiedByUser: sql`EXCLUDED."ModifiedByUser"`,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
              },
            })
            .returning()
      );
    } catch (error) {
      logger.error(
        'Failed to upsert batch into regulatory_source table',
        error as Error
      );
      throw error;
    }
  };

  return { upsertRegulatorySource };
}

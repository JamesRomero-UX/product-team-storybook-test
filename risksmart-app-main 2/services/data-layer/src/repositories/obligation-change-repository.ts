import { type DB } from '@risksmart-app/drizzle/src/db';
import { obligation_change } from '@risksmart-app/drizzle/src/schema';
import { sql } from 'drizzle-orm';

import { getLogger } from '../utils/logger';

const logger = getLogger();

export type ObligationChangeRepository = ReturnType<
  typeof createObligationChangeRepository
>;

export const createObligationChangeRepository = (db: DB['transaction']) => {
  const upsertExternalObligationChanges = async (
    values: (typeof obligation_change.$inferInsert)[]
  ): Promise<(typeof obligation_change.$inferInsert)[]> =>
    await db(async (tx) => {
      // Batching to avoid call stack size error. https://github.com/drizzle-team/drizzle-orm/issues/1740
      const batchSize = 100;
      const results: (typeof obligation_change.$inferInsert)[] = [];

      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);

        try {
          const inserted = await tx
            .insert(obligation_change)
            .values(batch)
            .onConflictDoUpdate({
              target: [
                obligation_change.OrgKey,
                obligation_change.ExternalId,
                obligation_change.ObligationId,
              ],
              set: {
                DescriptionBefore: sql`EXCLUDED."DescriptionBefore"`,
                DescriptionAfter: sql`EXCLUDED."DescriptionAfter"`,
                Rationale: sql`EXCLUDED."Rationale"`,
                ContentHash: sql`EXCLUDED."ContentHash"`,
                EffectiveDate: sql`EXCLUDED."EffectiveDate"`,
                SourceUrl: sql`EXCLUDED."SourceUrl"`,
                ModifiedByUser: sql`EXCLUDED."ModifiedByUser"`,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
              },
              where: sql`obligation_change."ContentHash" IS DISTINCT FROM EXCLUDED."ContentHash"`,
            })
            .returning();

          results.push(...inserted);
        } catch (error) {
          logger.error(
            'Failed to upsert batch into obligation_change table',
            error as Error
          );
          throw error;
        }
      }

      return results;
    });

  return { upsertExternalObligationChanges };
};

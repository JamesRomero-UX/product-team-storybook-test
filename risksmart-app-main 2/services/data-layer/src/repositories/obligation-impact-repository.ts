import type { DB } from '@risksmart-app/drizzle/src/db';
import { obligation_impact } from '@risksmart-app/drizzle/src/schema';
import { inArray } from 'drizzle-orm/sql/expressions';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export function createObligationImpactRepository(db: DB['transaction']) {
  return {
    insert: async (values: typeof obligation_impact.$inferInsert) =>
      await db(async (tx) => {
        try {
          return await tx.insert(obligation_impact).values(values).returning();
        } catch (error) {
          logger.error(
            'Failed to insert into obligation_impact table',
            error as Error
          );
          throw error;
        }
      }),

    deleteMany: async (ids: string[]): Promise<void> =>
      await db(async (tx) => {
        try {
          logger.info('Deleting multiple obligation impacts', {
            ids,
            count: ids.length,
          });
          const result = await tx
            .delete(obligation_impact)
            .where(inArray(obligation_impact.Id, ids))
            .returning();

          if (result.length !== ids.length) {
            logger.warn(
              'Mismatch in number of deleted obligation impacts, rolling back',
              {
                expectedCount: ids.length,
                actualCount: result.length,
              }
            );

            tx.rollback();
          }
        } catch (error) {
          logger.error(
            'Failed to delete from obligation_impact table',
            error as Error
          );
          throw error;
        }
      }),
  };
}

export type ObligationImpactRepository = ReturnType<
  typeof createObligationImpactRepository
>;

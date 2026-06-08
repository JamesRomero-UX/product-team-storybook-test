import type { DB } from '@risksmart-app/drizzle/src/db';
import { issue_update } from '@risksmart-app/drizzle/src/schema';
import { inArray } from 'drizzle-orm';

import { getLogger } from '../utils/logger';

const logger = getLogger();

export type IssueUpdateRepository = ReturnType<
  typeof createIssueUpdateRepository
>;

export function createIssueUpdateRepository(db: DB['transaction']) {
  return {
    deleteMany: async (ids: string[]) =>
      await db(async (tx) => {
        try {
          logger.info('Deleting one or more issue updates', {
            ids,
            count: ids.length,
          });

          const result = await tx
            .delete(issue_update)
            .where(inArray(issue_update.Id, ids))
            .returning({ Id: issue_update.Id });

          if (result.length !== ids.length) {
            logger.warn(
              'Mismatch in number of deleted issue updates, rolling back transaction',
              {
                expectedCount: ids.length,
                actualCount: result.length,
              }
            );

            tx.rollback();
          }

          return result.length;
        } catch (error) {
          logger.error(
            'Failed to delete from issue_update table',
            error as Error
          );
          throw error;
        }
      }),
    insert: async (values: typeof issue_update.$inferInsert) =>
      await db(async (tx) => {
        try {
          return tx.insert(issue_update).values(values).returning();
        } catch (error) {
          logger.error(
            'Failed to insert into issue_update table',
            error as Error
          );
          throw error;
        }
      }),
  };
}

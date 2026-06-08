import type { DB } from '@risksmart-app/drizzle/src/db';
import { control_group } from '@risksmart-app/drizzle/src/schema';
import { and, eq } from 'drizzle-orm/sql/expressions/conditions';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export function createControlGroupRepository(db: DB['transaction']) {
  return {
    insert: async (values: typeof control_group.$inferInsert) =>
      await db(async (tx) => {
        try {
          return await tx.insert(control_group).values(values).returning();
        } catch (error) {
          logger.error(
            'Failed to insert into control_group table',
            error as Error
          );
          throw error;
        }
      }),

    /**
     * Delete a control group by ID
     * Returns the number of affected rows
     */
    delete: async ({
      id,
      modifiedAtTimestamp,
    }: {
      id: string;
      modifiedAtTimestamp: string;
    }): Promise<number> => {
      try {
        logger.info('Deleting control group', { id });

        const result = await db(async (tx) => {
          return tx
            .delete(control_group)
            .where(
              and(
                eq(control_group.Id, id),
                eq(control_group.ModifiedAtTimestamp, modifiedAtTimestamp)
              )
            )
            .returning({ Id: control_group.Id });
        });

        if (result.length === 0) {
          logger.info('No control group deleted (not found or concurrency)', {
            id,
          });
        } else {
          logger.info('Control group deleted', { id });
        }

        return result.length;
      } catch (error) {
        logger.error('Failed to delete control group', {
          error,
          id,
        });
        throw error;
      }
    },
  };
}

export type ControlGroupRepository = ReturnType<
  typeof createControlGroupRepository
>;

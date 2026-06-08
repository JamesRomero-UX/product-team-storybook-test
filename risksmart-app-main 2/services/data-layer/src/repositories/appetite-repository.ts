import type { DB } from '@risksmart-app/drizzle/src/db';
import { appetite, appetite_parent } from '@risksmart-app/drizzle/src/schema';
import { eq, inArray, sql } from 'drizzle-orm';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type AppetiteRepository = ReturnType<typeof createAppetiteRepository>;

export function createAppetiteRepository(db: DB['transaction']) {
  return {
    /**
     * Insert an appetite record with parent relationships in a single transaction.
     * Inserts into `appetite` and `appetite_parent` atomically.
     */
    insertWithParents: async (
      values: Omit<typeof appetite.$inferInsert, 'SequentialId'>,
      parentIds: string[],
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [insertedAppetite] = await tx
            .insert(appetite)
            .values({
              ...values,
              SequentialId: sql`DEFAULT`,
            })
            .returning();

          if (!insertedAppetite?.Id) {
            throw new Error('Failed to retrieve inserted appetite ID');
          }

          const appetiteId = insertedAppetite.Id;
          const { userId, orgKey } = context;

          if (parentIds.length > 0) {
            await tx.insert(appetite_parent).values(
              parentIds.map((parentId) => ({
                Id: appetiteId,
                ParentId: parentId,
                OrgKey: orgKey,
                CreatedByUser: userId,
                ModifiedByUser: userId,
              }))
            );
          }

          return insertedAppetite;
        } catch (error) {
          logger.error(
            'Failed to insert appetite with parents',
            error as Error
          );
          throw error;
        }
      }),

    /**
     * Update an appetite by ID
     * Returns the updated record
     */
    update: async (
      id: string,
      values: Partial<typeof appetite.$inferInsert>,
      _context: ServiceContext
    ) => {
      try {
        logger.info('Updating appetite', { id });

        const [updated] = await db(async (tx) => {
          return tx
            .update(appetite)
            .set({
              ...values,
              ModifiedAtTimestamp: sql`statement_timestamp()`,
            })
            .where(eq(appetite.Id, id))
            .returning();
        });

        if (!updated) {
          throw new Error(`Appetite with id ${id} not found`);
        }

        logger.info('Updated appetite', { id: updated.Id });

        return updated;
      } catch (error) {
        logger.error('Failed to update appetite', { error, id });
        throw error;
      }
    },

    /**
     * Delete multiple appetites by IDs in a single transaction
     * Returns the IDs that were actually deleted
     * appetite_parent rows cascade on delete via FK
     */
    deleteMany: async (appetiteIds: string[]): Promise<string[]> => {
      try {
        logger.info('Deleting multiple appetites', {
          appetiteIds,
          count: appetiteIds.length,
        });

        const result = await db(async (tx) => {
          return tx
            .delete(appetite)
            .where(inArray(appetite.Id, appetiteIds))
            .returning({ Id: appetite.Id });
        });

        const deletedIds = result.map((r) => r.Id);

        logger.info('Deleted appetites', {
          requestedIds: appetiteIds,
          deletedIds,
          affectedRows: result.length,
        });

        return deletedIds;
      } catch (error) {
        logger.error('Failed to delete appetites', {
          error,
          appetiteIds,
        });
        throw error;
      }
    },
  };
}

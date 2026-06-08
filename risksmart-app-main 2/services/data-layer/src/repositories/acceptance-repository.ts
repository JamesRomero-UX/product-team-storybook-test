import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  acceptance,
  acceptance_parent,
} from '@risksmart-app/drizzle/src/schema';
import { eq, inArray, sql } from 'drizzle-orm';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type AcceptanceRepository = ReturnType<
  typeof createAcceptanceRepository
>;

export function createAcceptanceRepository(db: DB['transaction']) {
  return {
    /**
     * Insert an acceptance with its parent relationship in a single transaction
     */
    insertWithRelationships: async (
      values: typeof acceptance.$inferInsert,
      parentId: string,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const [inserted] = await tx
            .insert(acceptance)
            .values(values)
            .returning();

          if (!inserted?.Id) {
            throw new Error('Failed to retrieve inserted acceptance ID');
          }

          const acceptanceId = inserted.Id;
          const { userId, orgKey } = context;

          await tx.insert(acceptance_parent).values({
            Id: acceptanceId,
            ParentId: parentId,
            OrgKey: orgKey,
            CreatedByUser: userId,
            ModifiedByUser: userId,
          });

          return inserted;
        } catch (error) {
          logger.error(
            'Failed to insert acceptance with relationships',
            error as Error
          );
          throw error;
        }
      }),

    /**
     * Update an acceptance by ID
     * Returns the updated record
     */
    update: async (
      id: string,
      values: Partial<typeof acceptance.$inferInsert>,
      _context: ServiceContext
    ) => {
      try {
        logger.info('Updating acceptance', { id });

        const [updated] = await db(async (tx) => {
          return tx
            .update(acceptance)
            .set({
              ...values,
              ModifiedAtTimestamp: sql`statement_timestamp()`,
            })
            .where(eq(acceptance.Id, id))
            .returning();
        });

        if (!updated) {
          throw new Error(`Acceptance with id ${id} not found`);
        }

        logger.info('Updated acceptance', { id: updated.Id });

        return updated;
      } catch (error) {
        logger.error('Failed to update acceptance', { error, id });
        throw error;
      }
    },

    /**
     * Delete multiple acceptances by IDs in a single transaction
     * Returns the IDs that were actually deleted
     */
    deleteMany: async (acceptanceIds: string[]): Promise<string[]> => {
      try {
        logger.info('Deleting multiple acceptances', {
          acceptanceIds,
          count: acceptanceIds.length,
        });

        const result = await db(async (tx) => {
          return tx
            .delete(acceptance)
            .where(inArray(acceptance.Id, acceptanceIds))
            .returning({ Id: acceptance.Id });
        });

        const deletedIds = result.map((r) => r.Id);

        logger.info('Deleted acceptances', {
          requestedIds: acceptanceIds,
          deletedIds,
          affectedRows: result.length,
        });

        return deletedIds;
      } catch (error) {
        logger.error('Failed to delete acceptances', {
          error,
          acceptanceIds,
        });
        throw error;
      }
    },
  };
}

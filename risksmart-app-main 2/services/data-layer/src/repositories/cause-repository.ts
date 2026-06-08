import type { DB } from '@risksmart-app/drizzle/src/db';
import { cause } from '@risksmart-app/drizzle/src/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { Conflict } from 'http-errors';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type CauseRepository = ReturnType<typeof createCauseRepository>;

export const createCauseRepository = (db: DB['transaction']) => ({
  /**
   * Insert a new cause record
   * Returns the inserted record
   */
  insert: async (values: typeof cause.$inferInsert) =>
    await db(async (tx) => {
      try {
        const [inserted] = await tx.insert(cause).values(values).returning();

        if (!inserted?.Id) {
          throw new Error('Failed to retrieve inserted cause ID');
        }

        return inserted;
      } catch (error) {
        logger.error('Failed to insert cause', error as Error);
        throw error;
      }
    }),

  /**
   * Update a cause by ID with optimistic locking via OriginalTimestamp
   * Throws Conflict if the record has been modified since it was last read
   * Returns the updated record
   */
  update: async (
    id: string,
    values: Partial<typeof cause.$inferInsert>,
    context: ServiceContext,
    originalTimestamp: string
  ) =>
    await db(async (tx) => {
      try {
        // Fetch current record for optimistic locking
        const existing = await tx
          .select({
            Id: cause.Id,
            ModifiedAtTimestamp: cause.ModifiedAtTimestamp,
          })
          .from(cause)
          .where(and(eq(cause.Id, id), eq(cause.OrgKey, context.orgKey)))
          .limit(1);

        if (!existing[0]) {
          throw new Error(`Cause with id ${id} not found`);
        }

        // Compare ModifiedAtTimestamp for optimistic concurrency
        const currentTimestamp = new Date(
          String(existing[0].ModifiedAtTimestamp)
        ).toISOString();

        if (currentTimestamp !== originalTimestamp) {
          throw new Conflict(
            'Record has been modified by another user. Please refresh and try again.'
          );
        }

        const [updated] = await tx
          .update(cause)
          .set({
            ...values,
            ModifiedAtTimestamp: sql`statement_timestamp()`,
          })
          .where(and(eq(cause.Id, id), eq(cause.OrgKey, context.orgKey)))
          .returning();

        if (!updated) {
          throw new Error(`Cause with id ${id} not found`);
        }

        logger.info('Updated cause', { id: updated.Id });

        return updated;
      } catch (error) {
        logger.error('Failed to update cause', { error, id });
        throw error;
      }
    }),

  /**
   * Delete multiple causes by IDs in a single transaction
   * Returns the IDs that were actually deleted
   */
  deleteByIds: async (causeIds: string[]): Promise<string[]> => {
    try {
      logger.info('Deleting multiple causes', {
        causeIds,
        count: causeIds.length,
      });

      const result = await db(async (tx) => {
        return tx
          .delete(cause)
          .where(inArray(cause.Id, causeIds))
          .returning({ Id: cause.Id });
      });

      const deletedIds = result.map((r) => r.Id);

      logger.info('Deleted causes', {
        requestedIds: causeIds,
        deletedIds,
        affectedRows: result.length,
      });

      return deletedIds;
    } catch (error) {
      logger.error('Failed to delete causes', {
        error,
        causeIds,
      });
      throw error;
    }
  },
});

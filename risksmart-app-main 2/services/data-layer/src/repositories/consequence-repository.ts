import type { DB } from '@risksmart-app/drizzle/src/db';
import { consequence } from '@risksmart-app/drizzle/src/schema';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { Conflict } from 'http-errors';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export type ConsequenceRepository = ReturnType<
  typeof createConsequenceRepository
>;

export const createConsequenceRepository = (db: DB['transaction']) => ({
  /**
   * Insert a new consequence record
   * Returns the inserted record
   */
  insert: async (values: typeof consequence.$inferInsert) =>
    await db(async (tx) => {
      try {
        const [inserted] = await tx
          .insert(consequence)
          .values(values)
          .returning();

        if (!inserted?.Id) {
          throw new Error('Failed to retrieve inserted consequence ID');
        }

        return inserted;
      } catch (error) {
        logger.error('Failed to insert consequence', error as Error);
        throw error;
      }
    }),

  /**
   * Update a consequence by ID with optimistic locking via OriginalTimestamp
   * Throws Conflict if the record has been modified since it was last read
   * Returns the updated record
   */
  update: async (
    id: string,
    values: Partial<typeof consequence.$inferInsert>,
    context: ServiceContext,
    originalTimestamp: string
  ) =>
    await db(async (tx) => {
      try {
        // Fetch current record for optimistic locking
        const existing = await tx
          .select({
            Id: consequence.Id,
            ModifiedAtTimestamp: consequence.ModifiedAtTimestamp,
          })
          .from(consequence)
          .where(
            and(eq(consequence.Id, id), eq(consequence.OrgKey, context.orgKey))
          )
          .limit(1);

        if (!existing[0]) {
          throw new Error(`Consequence with id ${id} not found`);
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
          .update(consequence)
          .set({
            ...values,
            ModifiedAtTimestamp: sql`statement_timestamp()`,
          })
          .where(
            and(eq(consequence.Id, id), eq(consequence.OrgKey, context.orgKey))
          )
          .returning();

        if (!updated) {
          throw new Error(`Consequence with id ${id} not found`);
        }

        logger.info('Updated consequence', { id: updated.Id });

        return updated;
      } catch (error) {
        logger.error('Failed to update consequence', { error, id });
        throw error;
      }
    }),

  /**
   * Delete multiple consequences by IDs in a single transaction
   * Returns the IDs that were actually deleted
   */
  deleteByIds: async (consequenceIds: string[]): Promise<string[]> => {
    try {
      logger.info('Deleting multiple consequences', {
        consequenceIds,
        count: consequenceIds.length,
      });

      const result = await db(async (tx) => {
        return tx
          .delete(consequence)
          .where(inArray(consequence.Id, consequenceIds))
          .returning({ Id: consequence.Id });
      });

      const deletedIds = result.map((r) => r.Id);

      logger.info('Deleted consequences', {
        requestedIds: consequenceIds,
        deletedIds,
        affectedRows: result.length,
      });

      return deletedIds;
    } catch (error) {
      logger.error('Failed to delete consequences', {
        error,
        consequenceIds,
      });
      throw error;
    }
  },
});

import type { DB } from '@risksmart-app/drizzle/src/db';
import { indicator_result } from '@risksmart-app/drizzle/src/schema';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { BadRequest, NotFound } from 'http-errors';

import type { ServiceContext } from '../types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export function createIndicatorResultRepository(db: DB['transaction']) {
  return {
    getLatestByIndicatorId: async (indicatorId: string) =>
      await db(async (tx) => {
        try {
          const results = await tx
            .select({
              Id: indicator_result.Id,
              ResultDate: indicator_result.ResultDate,
            })
            .from(indicator_result)
            .where(eq(indicator_result.IndicatorId, indicatorId))
            .orderBy(desc(indicator_result.ResultDate))
            .limit(1);

          return results[0] ?? null;
        } catch (error) {
          logger.error(
            'Failed to get latest indicator result by indicator id',
            error as Error
          );
          throw error;
        }
      }),

    insert: async (values: typeof indicator_result.$inferInsert) =>
      await db(async (tx) => {
        const indicator = await tx.query.indicator.findFirst({
          where: { Id: values.IndicatorId },
          columns: { Id: true },
        });

        if (!indicator) {
          throw new BadRequest(
            `IndicatorId '${values.IndicatorId}' does not reference an existing indicator`
          );
        }

        try {
          return await tx.insert(indicator_result).values(values).returning();
        } catch (error) {
          logger.error(
            'Failed to insert into indicator_result table',
            error as Error
          );
          throw error;
        }
      }),

    update: async (
      id: string,
      values: Partial<typeof indicator_result.$inferInsert>,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const existing = await tx
            .select({ Id: indicator_result.Id })
            .from(indicator_result)
            .where(
              and(
                eq(indicator_result.Id, id),
                eq(indicator_result.OrgKey, context.orgKey)
              )
            )
            .limit(1);

          if (!existing[0]) {
            throw new NotFound('Indicator result not found');
          }

          const [updatedRecord] = await tx
            .update(indicator_result)
            .set({
              ...values,
              ModifiedAtTimestamp: sql`statement_timestamp()`,
            })
            .where(
              and(
                eq(indicator_result.Id, id),
                eq(indicator_result.OrgKey, context.orgKey)
              )
            )
            .returning();

          return updatedRecord;
        } catch (error) {
          logger.error('Failed to update indicator result', error as Error);
          throw error;
        }
      }),

    deleteMany: async (resultIds: string[]): Promise<string[]> => {
      try {
        logger.info('Deleting multiple indicator results', {
          resultIds,
          count: resultIds.length,
        });

        const result = await db(async (tx) => {
          return tx
            .delete(indicator_result)
            .where(inArray(indicator_result.Id, resultIds))
            .returning({ Id: indicator_result.Id });
        });

        const deletedIds = result.map((r) => r.Id);

        logger.info('Deleted indicator results', {
          requestedIds: resultIds,
          deletedIds,
          affectedRows: result.length,
        });

        return deletedIds;
      } catch (error) {
        logger.error('Failed to delete indicator results', { error });
        throw error;
      }
    },
  };
}

export type IndicatorResultRepository = ReturnType<
  typeof createIndicatorResultRepository
>;

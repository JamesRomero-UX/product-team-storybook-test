import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  assessment_result_parent,
  relation_file,
  test_result,
} from '@risksmart-app/drizzle/src/schema';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import { Conflict } from 'http-errors';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';

import type { CreateControlTestResultRequest } from '../schemas/test-result';

const logger = getLogger();

export type TestResultRepository = ReturnType<
  typeof createTestResultRepository
>;

export function createTestResultRepository(db: DB['transaction']) {
  return {
    getLatestByControlId: async (controlId: string) =>
      await db(async (tx) => {
        try {
          const results = await tx
            .select({
              Id: test_result.Id,
              TestDate: test_result.TestDate,
            })
            .from(test_result)
            .where(
              and(
                eq(test_result.ParentControlId, controlId),
                inArray(test_result.RatingType, ['assessment', 'rating'])
              )
            )
            .orderBy(desc(test_result.TestDate))
            .limit(1);

          return results[0] ?? null;
        } catch (error) {
          logger.error(
            'Failed to get latest test result by control id',
            error as Error
          );
          throw error;
        }
      }),

    insertBulk: async (
      payload: CreateControlTestResultRequest,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const { userId, orgKey } = context;
          const hasAssessment = !!payload.AssessmentId;
          const ratingType = hasAssessment ? 'assessment' : 'rating';

          // Build one test_result record per ControlId
          const resultRecords = payload.ControlIds.map((controlId) => ({
            Id: crypto.randomUUID(),
            controlId,
          }));

          // Insert all test_result records
          const insertedResults = await tx
            .insert(test_result)
            .values(
              resultRecords.map(({ Id, controlId }) => ({
                Id,
                ParentControlId: controlId,
                Title: payload.Title ?? null,
                TestType: payload.TestType ?? null,
                Description: payload.Description ?? '',
                DesignEffectiveness: payload.DesignEffectiveness ?? null,
                PerformanceEffectiveness:
                  payload.PerformanceEffectiveness ?? null,
                OverallEffectiveness: payload.OverallEffectiveness ?? null,
                Submitter: payload.Submitter ?? userId,
                TestDate: payload.TestDate ?? new Date().toISOString(),
                OrgKey: orgKey,
                CreatedByUser: userId,
                ModifiedByUser: userId,
                CreatedAtTimestamp: sql`statement_timestamp()`,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
                CustomAttributeData:
                  (payload.CustomAttributeData as JSONB) ?? null,
                RatingType: ratingType,
                SequentialId: sql`DEFAULT`,
              }))
            )
            .returning();

          // Build assessment_result_parent records linking each result to its control
          const parentRecords = resultRecords.flatMap(({ Id, controlId }) => {
            const records: (typeof assessment_result_parent.$inferInsert)[] = [
              {
                Id,
                ParentId: controlId,
                ParentType: 'control',
                ResultType: 'test_result',
                OrgKey: orgKey,
                CreatedByUser: userId,
                ModifiedByUser: userId,
              },
            ];

            // If AssessmentId is provided, also link to the assessment
            if (payload.AssessmentId) {
              records.push({
                Id,
                ParentId: payload.AssessmentId,
                ParentType: 'assessment',
                ResultType: 'test_result',
                OrgKey: orgKey,
                CreatedByUser: userId,
                ModifiedByUser: userId,
              });
            }

            return records;
          });

          if (parentRecords.length > 0) {
            await tx.insert(assessment_result_parent).values(parentRecords);
          }

          return insertedResults;
        } catch (error) {
          logger.error('Failed to insert test results', error as Error);
          throw error;
        }
      }),

    update: async (
      id: string,
      values: Partial<typeof test_result.$inferInsert>,
      originalTimestamp: string,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          // Fetch current record for optimistic locking
          const existing = await tx
            .select({
              Id: test_result.Id,
              ModifiedAtTimestamp: test_result.ModifiedAtTimestamp,
            })
            .from(test_result)
            .where(
              and(
                eq(test_result.Id, id),
                eq(test_result.OrgKey, context.orgKey)
              )
            )
            .limit(1);

          if (!existing[0]) {
            throw new Error('Test result not found');
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

          const [updatedRecord] = await tx
            .update(test_result)
            .set({
              ...values,
              ModifiedAtTimestamp: sql`statement_timestamp()`,
            })
            .where(
              and(
                eq(test_result.Id, id),
                eq(test_result.OrgKey, context.orgKey)
              )
            )
            .returning();

          return updatedRecord;
        } catch (error) {
          logger.error('Failed to update test result', error as Error);
          throw error;
        }
      }),

    deleteMany: async (ids: string[]): Promise<string[]> => {
      try {
        logger.info('Deleting multiple test results', {
          ids,
          count: ids.length,
        });

        const result = await db(async (tx) => {
          // Delete related relation_file records first
          await tx
            .delete(relation_file)
            .where(inArray(relation_file.ParentId, ids));

          // Delete the test_result records
          return tx
            .delete(test_result)
            .where(inArray(test_result.Id, ids))
            .returning({ Id: test_result.Id });
        });

        const deletedIds = result.map((r) => r.Id);

        logger.info('Deleted test results', {
          requestedIds: ids,
          deletedIds,
          affectedRows: result.length,
        });

        return deletedIds;
      } catch (error) {
        logger.error('Failed to delete test results', {
          error,
          ids,
        });
        throw error;
      }
    },
  };
}

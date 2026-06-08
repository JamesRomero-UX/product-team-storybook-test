import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  assessment_result_parent,
  obligation_assessment_result,
} from '@risksmart-app/drizzle/src/schema';
import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export type ObligationAssessmentResultRepository = ReturnType<
  typeof createObligationAssessmentResultRepository
>;

export function createObligationAssessmentResultRepository(
  db: DB['transaction']
) {
  return {
    getLatestByObligationId: async (obligationId: string) =>
      await db(async (tx) => {
        try {
          const results = await tx
            .select({
              Id: obligation_assessment_result.Id,
              TestDate: obligation_assessment_result.TestDate,
            })
            .from(obligation_assessment_result)
            .innerJoin(
              assessment_result_parent,
              eq(assessment_result_parent.Id, obligation_assessment_result.Id)
            )
            .where(
              and(
                eq(assessment_result_parent.ParentId, obligationId),
                eq(assessment_result_parent.ParentType, 'obligation'),
                inArray(obligation_assessment_result.RatingType, [
                  'assessment',
                  'rating',
                ]),
                isNotNull(obligation_assessment_result.TestDate)
              )
            )
            .orderBy(desc(obligation_assessment_result.TestDate))
            .limit(1);

          return results[0] ?? null;
        } catch (error) {
          logger.error(
            'Failed to get latest obligation assessment result by obligation id',
            error as Error
          );
          throw error;
        }
      }),
  };
}

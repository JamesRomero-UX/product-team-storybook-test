import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  assessment_result_parent,
  document_assessment_result,
} from '@risksmart-app/drizzle/src/schema';
import { and, desc, eq, inArray, isNotNull } from 'drizzle-orm';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export type DocumentAssessmentResultRepository = ReturnType<
  typeof createDocumentAssessmentResultRepository
>;

export function createDocumentAssessmentResultRepository(
  db: DB['transaction']
) {
  return {
    getLatestByDocumentId: async (documentId: string) =>
      await db(async (tx) => {
        try {
          const results = await tx
            .select({
              Id: document_assessment_result.Id,
              TestDate: document_assessment_result.TestDate,
            })
            .from(document_assessment_result)
            .innerJoin(
              assessment_result_parent,
              eq(assessment_result_parent.Id, document_assessment_result.Id)
            )
            .where(
              and(
                eq(assessment_result_parent.ParentId, documentId),
                eq(assessment_result_parent.ParentType, 'document'),
                inArray(document_assessment_result.RatingType, [
                  'assessment',
                  'rating',
                ]),
                isNotNull(document_assessment_result.TestDate)
              )
            )
            .orderBy(desc(document_assessment_result.TestDate))
            .limit(1);

          return results[0] ?? null;
        } catch (error) {
          logger.error(
            'Failed to get latest document assessment result by document id',
            error as Error
          );
          throw error;
        }
      }),
  };
}

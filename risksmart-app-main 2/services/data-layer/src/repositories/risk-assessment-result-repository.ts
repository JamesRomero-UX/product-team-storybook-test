import type { JSONB } from '@risksmart-app/domain/src/types/common.types';
import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  assessment_result_parent,
  risk_assessment_result,
} from '@risksmart-app/drizzle/src/schema';
import { and, desc, eq, inArray, isNotNull, sql } from 'drizzle-orm';
import type { ServiceContext } from 'src/types';
import { getLogger } from 'src/utils/logger';

import type { CreateRiskAssessmentResultRequest } from '../schemas/risk-assessment-result';

const logger = getLogger();

export type RiskAssessmentResultRepository = ReturnType<
  typeof createRiskAssessmentResultRepository
>;

export function createRiskAssessmentResultRepository(db: DB['transaction']) {
  return {
    getLatestByRiskId: async (riskId: string) =>
      await db(async (tx) => {
        try {
          const results = await tx
            .select({
              Id: risk_assessment_result.Id,
              Impact: risk_assessment_result.Impact,
              Likelihood: risk_assessment_result.Likelihood,
              Rating: risk_assessment_result.Rating,
              ControlType: risk_assessment_result.ControlType,
              TestDate: risk_assessment_result.TestDate,
            })
            .from(risk_assessment_result)
            .innerJoin(
              assessment_result_parent,
              eq(assessment_result_parent.Id, risk_assessment_result.Id)
            )
            .where(
              and(
                eq(assessment_result_parent.ParentId, riskId),
                eq(assessment_result_parent.ParentType, 'risk'),
                inArray(risk_assessment_result.RatingType, [
                  'assessment',
                  'rating',
                ]),
                isNotNull(risk_assessment_result.TestDate)
              )
            )
            .orderBy(desc(risk_assessment_result.TestDate))
            .limit(1);

          return results[0] ?? null;
        } catch (error) {
          logger.error(
            'Failed to get latest risk assessment result by risk id',
            error as Error
          );
          throw error;
        }
      }),

    insertMany: async (
      payload: CreateRiskAssessmentResultRequest,
      context: ServiceContext
    ) =>
      await db(async (tx) => {
        try {
          const { userId, orgKey } = context;
          const ratingType = payload.AssessmentId ? 'assessment' : 'rating';

          // Build one risk_assessment_result record per RiskId
          const resultRecords = payload.RiskIds.map((riskId) => ({
            Id: crypto.randomUUID(),
            riskId,
          }));

          // Insert all risk_assessment_result records
          const insertedResults = await tx
            .insert(risk_assessment_result)
            .values(
              resultRecords.map(({ Id }) => ({
                Id,
                ControlType: payload.ControlType,
                Likelihood: payload.Likelihood ?? null,
                Impact: payload.Impact ?? null,
                Rating: payload.Rating ?? null,
                OrgKey: orgKey,
                CreatedByUser: userId,
                ModifiedByUser: userId,
                CreatedAtTimestamp: sql`statement_timestamp()`,
                ModifiedAtTimestamp: sql`statement_timestamp()`,
                CustomAttributeData:
                  (payload.CustomAttributeData as JSONB) ?? null,
                Rationale: payload.Rationale ?? null,
                TestDate: payload.TestDate ?? null,
                RatingType: ratingType,
                ConfigId: payload.ConfigId ?? null,
              }))
            )
            .returning();

          // Build assessment_result_parent records linking each result to its risk
          const parentRecords = resultRecords.flatMap(({ Id, riskId }) => {
            const records: (typeof assessment_result_parent.$inferInsert)[] = [
              {
                Id,
                ParentId: riskId,
                ParentType: 'risk',
                ResultType: 'risk_assessment_result',
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
                ResultType: 'risk_assessment_result',
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
          logger.error(
            'Failed to insert risk assessment results',
            error as Error
          );
          throw error;
        }
      }),
  };
}

import type { DB } from '@risksmart-app/drizzle/src/db';
import { risk_assessment_result_config } from '@risksmart-app/drizzle/src/schema';
import { eq } from 'drizzle-orm';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export type RiskAssessmentResultConfigRepository = ReturnType<
  typeof createRiskAssessmentResultConfigRepository
>;

export const createRiskAssessmentResultConfigRepository = (
  db: DB['transaction']
) => ({
  getLatestId: async (): Promise<string | null> =>
    await db(async (tx) => {
      try {
        const rows = await tx
          .select({ Id: risk_assessment_result_config.Id })
          .from(risk_assessment_result_config)
          .where(eq(risk_assessment_result_config.IsLatest, true))
          .limit(1);

        return rows[0]?.Id ?? null;
      } catch (error) {
        logger.error(
          'Failed to get latest risk assessment result config id',
          error as Error
        );
        throw error;
      }
    }),
});

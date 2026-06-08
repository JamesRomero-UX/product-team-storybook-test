import type { DB } from '@risksmart-app/drizzle/src/db';
import { impact, impact_rating } from '@risksmart-app/drizzle/src/schema';
import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export type ImpactRatingRepository = ReturnType<
  typeof createImpactRatingRepository
>;

export function createImpactRatingRepository(db: DB['transaction']) {
  return {
    /**
     * For each impact in the org, get the latest TestDate from impact_rating
     * where RatedItemId = riskId and TestDate IS NOT NULL.
     * From those latest dates, return the OLDEST (minimum) one.
     */
    getOldestActiveTestDateByRiskId: async (riskId: string, orgKey: string) =>
      await db(async (tx) => {
        try {
          // Get all impacts in the org
          const impacts = await tx
            .select({
              Id: impact.Id,
            })
            .from(impact)
            .where(eq(impact.OrgKey, orgKey));

          if (impacts.length === 0) {
            return null;
          }

          // For each impact, get the latest TestDate for the given riskId
          const latestDates: string[] = [];

          for (const imp of impacts) {
            const latestRating = await tx
              .select({
                TestDate: impact_rating.TestDate,
              })
              .from(impact_rating)
              .where(
                and(
                  eq(impact_rating.ImpactId, imp.Id),
                  eq(impact_rating.RatedItemId, riskId),
                  isNotNull(impact_rating.TestDate)
                )
              )
              .orderBy(desc(impact_rating.TestDate))
              .limit(1);

            if (latestRating[0]?.TestDate) {
              latestDates.push(latestRating[0].TestDate);
            }
          }

          if (latestDates.length === 0) {
            return null;
          }

          // Return the oldest (minimum) of the latest dates
          // ISO date strings sort correctly with localeCompare
          latestDates.sort((a, b) => a.localeCompare(b));

          return latestDates[0]!;
        } catch (error) {
          logger.error(
            'Failed to get oldest active impact test date by risk id',
            error as Error
          );
          throw error;
        }
      }),
  };
}

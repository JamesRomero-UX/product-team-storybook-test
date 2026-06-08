import type { DB } from '@risksmart-app/drizzle/src/db';
import { getLogger } from 'src/utils/logger';

const logger = getLogger();

export type AggregationSettingsRepository = ReturnType<
  typeof createAggregationSettingsRepository
>;

export function createAggregationSettingsRepository(db: DB['transaction']) {
  return {
    getForOrg: async (orgKey: string) =>
      await db(async (tx) => {
        try {
          return tx.query.aggregation_org.findFirst({
            where: { OrgKey: { eq: orgKey } },
          });
        } catch (error) {
          logger.error(
            'Failed to get aggregation settings for org',
            error as Error
          );
          throw error;
        }
      }),
  };
}

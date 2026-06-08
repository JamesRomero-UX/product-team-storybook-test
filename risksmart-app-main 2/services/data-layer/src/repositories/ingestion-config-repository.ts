import type { DB } from '@risksmart-app/drizzle/src/db';
import { getIngestionConfigsQueryConfig } from '@risksmart-app/drizzle/src/queries/ingestion-config.query';

import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for ingestion config data access
 */
export function createIngestionConfigRepository(db: DB['transaction']) {
  return {
    getAll: async () => {
      try {
        return await db((tx) => {
          return tx.query.ingestion_config.findMany({
            ...getIngestionConfigsQueryConfig,
          });
        });
      } catch (error) {
        logger.error('Failed to query ingestion configs', { error });
        throw error;
      }
    },
  };
}

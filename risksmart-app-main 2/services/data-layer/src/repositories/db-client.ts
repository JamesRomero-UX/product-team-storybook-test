import { createDrizzleClient } from '@risksmart-app/drizzle/src/db';

import { getLogger } from '../utils/logger';

const logger = getLogger();

interface DatabaseConfig {
  tenant: string;
  orgKey: string;
}

export const getDatabaseConnection = async (config: DatabaseConfig) => {
  logger.info('Attempting database connection', {
    tenant: config.tenant,
    orgKey: config.orgKey,
    region: process.env.AWS_REGION || 'unknown',
  });

  try {
    const drizzleClient = await createDrizzleClient({
      tenant: config.tenant,
      orgId: config.orgKey,
    });
    logger.info('Database connection established successfully');

    return drizzleClient.org;
  } catch (error) {
    logger.error('Failed to establish database connection', error as Error);
    throw error;
  }
};

import type { DB } from '@risksmart-app/drizzle/src/db';
import { getUsersQueryConfig } from '@risksmart-app/drizzle/src/queries/user.query';

import type { UserRow } from '../types/user.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for user data access
 */
export function createUserRepository(db: DB['transaction']) {
  return {
    /**
     * Get all users for the tenant
     */
    getAll: async (): Promise<UserRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.user.findMany({
            ...getUsersQueryConfig,
          });
        });
      } catch (error) {
        logger.error('Failed to query users', { error });
        throw error;
      }
    },
  };
}

import type { DB } from '@risksmart-app/drizzle/src/db';
import { getUserRolesQueryConfig } from '@risksmart-app/drizzle/src/queries/user-role.query';

import type { UserRoleRow } from '../types/user-role.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for user role data access
 */
export function createUserRoleRepository(db: DB['transaction']) {
  return {
    /**
     * Get all user roles for an organization
     */
    getAll: async (orgKey: string): Promise<UserRoleRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.user_role.findMany({
            ...getUserRolesQueryConfig,
            where: { OrgKey: { eq: orgKey } },
          });
        });
      } catch (error) {
        logger.error('Failed to query user roles', { error, orgKey });
        throw error;
      }
    },
  };
}

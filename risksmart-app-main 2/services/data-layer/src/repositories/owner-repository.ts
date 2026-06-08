import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  getOwnerGroupsQueryConfig,
  getOwnersQueryConfig,
} from '@risksmart-app/drizzle/src/queries/owner.query';

import type { OwnerGroupRow, OwnerRow } from '../types/owner.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for owner data access
 */
export function createOwnerRepository(db: DB['transaction']) {
  return {
    /**
     * Get all owners for an organization
     */
    getAll: async (orgKey: string): Promise<OwnerRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.owner.findMany({
            ...getOwnersQueryConfig,
            where: { OrgKey: { eq: orgKey } },
          });
        });
      } catch (error) {
        logger.error('Failed to query owners', { error, orgKey });
        throw error;
      }
    },

    /**
     * Get all owner groups for an organization
     */
    getAllGroups: async (orgKey: string): Promise<OwnerGroupRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.owner_group.findMany({
            ...getOwnerGroupsQueryConfig,
            where: { OrgKey: { eq: orgKey } },
          });
        });
      } catch (error) {
        logger.error('Failed to query owner groups', { error, orgKey });
        throw error;
      }
    },
  };
}

import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  getContributorGroupsQueryConfig,
  getContributorsQueryConfig,
} from '@risksmart-app/drizzle/src/queries/contributor.query';

import type {
  ContributorGroupRow,
  ContributorRow,
} from '../types/contributor.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for contributor data access
 */
export function createContributorRepository(db: DB['transaction']) {
  return {
    /**
     * Get all contributors for an organization
     */
    getAll: async (orgKey: string): Promise<ContributorRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.contributor.findMany({
            ...getContributorsQueryConfig,
            where: { OrgKey: { eq: orgKey } },
          });
        });
      } catch (error) {
        logger.error('Failed to query contributors', { error, orgKey });
        throw error;
      }
    },

    /**
     * Get all contributor groups for an organization
     */
    getAllGroups: async (orgKey: string): Promise<ContributorGroupRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.contributor_group.findMany({
            ...getContributorGroupsQueryConfig,
            where: { OrgKey: { eq: orgKey } },
          });
        });
      } catch (error) {
        logger.error('Failed to query contributor groups', { error, orgKey });
        throw error;
      }
    },
  };
}

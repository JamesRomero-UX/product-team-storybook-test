import type { DB } from '@risksmart-app/drizzle/src/db';
import { getOrganisationsQueryConfig } from '@risksmart-app/drizzle/src/queries/organisation.query';

import type { OrganisationRow } from '../types/organisation.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for organisation data access
 */
export function createOrganisationRepository(db: DB['transaction']) {
  return {
    /**
     * Get organisations
     */
    getAll: async (): Promise<OrganisationRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.organisation.findMany({
            ...getOrganisationsQueryConfig,
          });
        });
      } catch (error) {
        logger.error('Failed to query organisations', { error });
        throw error;
      }
    },

    /**
     * Get a single organisation by OrgKey
     */
    getByOrgKey: async (orgKey: string): Promise<OrganisationRow | null> => {
      try {
        return (
          (await db((tx) =>
            tx.query.organisation.findFirst({
              ...getOrganisationsQueryConfig,
              where: { OrgKey: orgKey },
            })
          )) ?? null
        );
      } catch (error) {
        logger.error('Failed to query organisation by orgKey', {
          error,
          orgKey,
        });
        throw error;
      }
    },
  };
}

export type OrganisationRepository = ReturnType<
  typeof createOrganisationRepository
>;

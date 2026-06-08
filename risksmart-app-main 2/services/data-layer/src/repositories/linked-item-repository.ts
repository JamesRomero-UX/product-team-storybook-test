import type { DB } from '@risksmart-app/drizzle/src/db';
import { getParentChildLinkedItemsQueryConfig } from '@risksmart-app/drizzle/src/queries/linked-item.query';
import { RelationshipType } from '@risksmart-app/events/src/types/common';

import type { LinkedItemRow } from '../types/linked-item.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Repository for linked item data access
 */
export function createLinkedItemRepository(db: DB['transaction']) {
  return {
    /**
     * Get all parent-child linked items for an organization
     */
    getAll: async (orgKey: string): Promise<LinkedItemRow[]> => {
      try {
        return await db((tx) => {
          return tx.query.linked_item.findMany({
            ...getParentChildLinkedItemsQueryConfig,
            where: {
              RelationshipType: RelationshipType.ParentChild,
              OrgKey: { eq: orgKey },
            },
          });
        });
      } catch (error) {
        logger.error('Failed to query linked items', { error, orgKey });
        throw error;
      }
    },
  };
}

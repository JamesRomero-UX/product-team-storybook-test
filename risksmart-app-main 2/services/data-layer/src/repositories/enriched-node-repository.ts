import type { DB } from '@risksmart-app/drizzle/src/db';
import { getEnrichedNodeByIdQueryConfig } from '@risksmart-app/drizzle/src/queries/node.query';

import type { GetEnrichedNodeByIdResponseRow } from '../types/node.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

/**
 * Enriched node type with all relationships
 */
export type EnrichedNodeResult = GetEnrichedNodeByIdResponseRow;

export interface EnrichedNodeFilters {
  nodeIds?: string[];
}

/**
 * Repository for enriched node data access.
 */
export function createEnrichedNodeRepository(db: DB['transaction']) {
  return {
    /**
     * Retrieves enriched nodes with all relationships.
     *
     * @param filters - Optional filters to narrow the result set. If omitted, all nodes are returned.
     *   - `nodeIds`: return only nodes whose ID is in this list.
     * @returns An array of enriched node rows matching the filter criteria.
     */
    getMany: async (
      filters: EnrichedNodeFilters = {}
    ): Promise<GetEnrichedNodeByIdResponseRow[]> => {
      const { nodeIds } = filters;

      try {
        return await db((tx) => {
          return tx.query.node.findMany({
            ...getEnrichedNodeByIdQueryConfig,
            where: {
              ...(nodeIds && { Id: { in: nodeIds } }),
            },
          });
        });
      } catch (error) {
        logger.error('Failed to query enriched nodes', { error });
        throw error;
      }
    },
  };
}

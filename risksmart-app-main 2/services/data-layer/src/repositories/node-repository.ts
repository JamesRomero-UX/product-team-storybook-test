import type { DB } from '@risksmart-app/drizzle/src/db';
import {
  getNodeByIdQueryConfig,
  getNodesQueryConfig,
} from '@risksmart-app/drizzle/src/queries/node.query';

import type { GetNodeByIdResponseRow, NodeRow } from '../types/node.types';
import { getLogger } from '../utils/logger';

const logger = getLogger();

export interface NodeFilters {
  nodeIds?: string[];
}

/**
 * Repository for node data access.
 */
export function createNodeRepository(db: DB['transaction']) {
  return {
    /**
     * Get a single node by ID.
     */
    getById: async (
      id: string
    ): Promise<GetNodeByIdResponseRow | undefined> => {
      try {
        return await db((tx) => {
          return tx.query.node.findFirst({
            ...getNodeByIdQueryConfig,
            where: { Id: { eq: id } },
          });
        });
      } catch (error) {
        logger.error('Failed to query node by ID', { error, id });
        throw error;
      }
    },

    /**
     * Retrieves nodes with basic info.
     *
     * @param filters - Optional filters to narrow the result set. If omitted, all nodes are returned.
     *   - `nodeIds`: return only nodes whose ID is in this list.
     * @returns An array of node rows matching the filter criteria.
     */
    getMany: async (filters: NodeFilters = {}): Promise<NodeRow[]> => {
      const { nodeIds } = filters;

      try {
        return await db((tx) => {
          return tx.query.node.findMany({
            ...getNodesQueryConfig,
            where: {
              ...(nodeIds && { Id: { in: nodeIds } }),
            },
          });
        });
      } catch (error) {
        logger.error('Failed to query nodes', { error });
        throw error;
      }
    },
  };
}

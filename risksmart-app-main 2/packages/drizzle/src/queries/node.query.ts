import type { QueryConfig } from '../db';
import { enrichedNode } from './fragments/index';

export const getEnrichedNodeByIdQueryConfig = {
  ...enrichedNode,
} as const satisfies QueryConfig<'node'>;

/**
 * Query configuration for getting a single node by ID
 */
export const getNodeByIdQueryConfig = {
  columns: {
    Id: true,
    OrgKey: true,
    ObjectType: true,
  },
} as const satisfies QueryConfig<'node'>;

/**
 * Query configuration for nodes (basic info for sync)
 */
export const getNodesQueryConfig = getNodeByIdQueryConfig;

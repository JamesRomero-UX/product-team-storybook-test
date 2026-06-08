import type { InferQueryModel } from '@risksmart-app/drizzle/src/db';
import type {
  getEnrichedNodeByIdQueryConfig,
  getNodeByIdQueryConfig,
  getNodesQueryConfig,
} from '@risksmart-app/drizzle/src/queries/node.query';

export type GetEnrichedNodeByIdResponseRow = InferQueryModel<
  'node',
  typeof getEnrichedNodeByIdQueryConfig
>;

export type GetNodeByIdResponseRow = InferQueryModel<
  'node',
  typeof getNodeByIdQueryConfig
>;

export type NodeRow = InferQueryModel<'node', typeof getNodesQueryConfig>;

import type { Route } from '@middy/http-router';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { createHandler } from '../create-handler';
import { getContributorGroupsProcessor } from './processors/contributor-groups';
import { getContributorsProcessor } from './processors/contributors';
import { getIngestionConfigsProcessor } from './processors/ingestion-configs';
import { getLinkedItemsProcessor } from './processors/linked-items';
import { getNodesProcessor } from './processors/nodes/get';
import { getNodeByIdProcessor } from './processors/nodes/get-by-id';
import { getEnrichedNodeProcessor } from './processors/nodes/get-enriched';
import { getOrganisationsProcessor } from './processors/organisations';
import { getOwnerGroupsProcessor } from './processors/owner-groups';
import { getOwnersProcessor } from './processors/owners';
import { getUserGroupUsersProcessor } from './processors/user-group-users';
import { getUserGroupsProcessor } from './processors/user-groups';
import { getUserRolesProcessor } from './processors/user-roles';
import { getUsersProcessor } from './processors/users';

/**
 * Route definitions for internal API (backend/service-to-service calls).
 *
 * These routes are consumed by the permissions service for data synchronization.
 * All routes are read-only GET endpoints returning bulk data.
 *
 * API Gateway uses a greedy {proxy+} route which forwards all paths to this Lambda,
 * and the http-router handles path matching internally.
 */
const routes: Route<APIGatewayProxyEvent, APIGatewayProxyResult>[] = [
  // Node endpoints - used for permissions sync
  {
    method: 'GET',
    path: '/nodes',
    handler: getNodesProcessor,
  },
  {
    method: 'GET',
    path: '/nodes/{objectId}',
    handler: getNodeByIdProcessor,
  },
  {
    method: 'GET',
    path: '/nodes/enriched',
    handler: getEnrichedNodeProcessor,
  },

  // User management endpoints
  {
    method: 'GET',
    path: '/user-groups',
    handler: getUserGroupsProcessor,
  },
  {
    method: 'GET',
    path: '/user-group-users',
    handler: getUserGroupUsersProcessor,
  },
  {
    method: 'GET',
    path: '/users',
    handler: getUsersProcessor,
  },
  {
    method: 'GET',
    path: '/user-roles',
    handler: getUserRolesProcessor,
  },

  // Relationship endpoints
  {
    method: 'GET',
    path: '/linked-items',
    handler: getLinkedItemsProcessor,
  },
  {
    method: 'GET',
    path: '/owners',
    handler: getOwnersProcessor,
  },
  {
    method: 'GET',
    path: '/contributors',
    handler: getContributorsProcessor,
  },
  {
    method: 'GET',
    path: '/owner-groups',
    handler: getOwnerGroupsProcessor,
  },
  {
    method: 'GET',
    path: '/contributor-groups',
    handler: getContributorGroupsProcessor,
  },

  // Organisation endpoint
  {
    method: 'GET',
    path: '/organisations',
    handler: getOrganisationsProcessor,
  },

  // Ingestion config endpoint
  {
    method: 'GET',
    path: '/ingestion-configs',
    handler: getIngestionConfigsProcessor,
  },
];

/**
 * Internal API Lambda handler - entry point
 *
 * Serves backend/service-to-service calls, primarily for the permissions service.
 * Uses middy http-router for request routing with standard middleware stack.
 */
export const handler = createHandler(routes);

// Export routes for testing
export { routes };

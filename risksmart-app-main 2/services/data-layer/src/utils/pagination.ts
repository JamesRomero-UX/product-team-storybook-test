import type { APIGatewayProxyEvent } from 'aws-lambda';

import type { PaginatedResponse } from '../types/api-responses';

/**
 * Default pagination settings
 */
export const DEFAULT_LIMIT = 50;
export const MAX_LIMIT = 10000;

/**
 * Pagination parameters extracted from query string
 */
export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * Extract pagination parameters from API Gateway event query string
 */
export function extractPaginationParams(
  event: APIGatewayProxyEvent
): PaginationParams {
  const queryParams = event.queryStringParameters || {};

  let limit = queryParams.limit
    ? parseInt(queryParams.limit, 10)
    : DEFAULT_LIMIT;

  // Ensure limit is within bounds
  if (isNaN(limit) || limit < 1) {
    limit = DEFAULT_LIMIT;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  let offset = queryParams.offset ? parseInt(queryParams.offset, 10) : 0;

  // Ensure offset is non-negative
  if (isNaN(offset) || offset < 0) {
    offset = 0;
  }

  return { limit, offset };
}

/**
 * Apply pagination to an array and return paginated response
 */
export function paginateResults<T>(
  items: T[],
  pagination: PaginationParams
): PaginatedResponse<T> {
  const { limit, offset } = pagination;
  const total = items.length;
  const paginatedItems = items.slice(offset, offset + limit);

  const hasNextPage = offset + limit < total;
  const hasPreviousPage = offset > 0;

  return {
    data: paginatedItems,
    pageMetadata: {
      hasNextPage,
      hasPreviousPage,
      nextCursor: hasNextPage ? offset + limit : null,
      previousCursor: hasPreviousPage ? Math.max(0, offset - limit) : null,
    },
  };
}

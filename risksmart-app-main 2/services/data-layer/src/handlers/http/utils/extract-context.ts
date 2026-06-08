import type { APIGatewayProxyEvent } from 'aws-lambda';
import { BadRequest } from 'http-errors';
import type { ServiceContext } from 'src/types';

/**
 * Extracts service context (tenant, orgKey, userId, correlationId) from request headers
 * These headers must be set by the calling service
 *
 * @param event - API Gateway event
 * @returns ServiceContext with tenant, orgKey, userId, and optional correlationId
 * @throws BadRequest if any required header is missing
 */
export const extractServiceContext = (
  event: APIGatewayProxyEvent
): ServiceContext => {
  // Case-insensitive header lookup — real API Gateway lowercases keys,
  // but SAM local preserves original casing (e.g., X-Tenant vs x-tenant)
  const getHeader = (name: string): string | undefined => {
    const lower = name.toLowerCase();
    for (const [key, value] of Object.entries(event.headers)) {
      if (key.toLowerCase() === lower) {
        return value;
      }
    }

    return undefined;
  };

  const tenant = getHeader('x-tenant');
  const orgKey = getHeader('x-org-key');
  const userId = getHeader('x-user-id');
  const correlationId = getHeader('x-correlation-id');

  if (!tenant || !orgKey || !userId) {
    throw new BadRequest(
      'Missing required context headers: x-tenant, x-org-key, x-user-id'
    );
  }

  return { tenant, orgKey, userId, correlationId };
};

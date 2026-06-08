import createHttpError from 'http-errors';

import type { MutateServiceContext } from '../../schemas/common/base.schema';
import type { AuthenticatedRequest } from '../../types/request';

/**
 * Extracts the service context (auth info) from an authenticated request.
 * Used to pass org/tenant/actor information to mutation services.
 */
export const getServiceContext = (
  req: AuthenticatedRequest
): MutateServiceContext => {
  const claims = req.auth?.['https://hasura.io/jwt/claims'];

  return {
    actorId: claims?.['x-hasura-user-id'],
    orgId: req.auth?.org_id ?? claims?.['x-hasura-org-id'] ?? '',
    tenantId: req.auth?.tenant_id ?? claims?.['x-hasura-tenant-name'] ?? '',
    authToken: req.headers?.authorization || '',
  };
};

/**
 * Extracts the service context and validates that actorId is present.
 * Throws if actorId is missing.
 */
export const getServiceContextWithActor = (
  req: AuthenticatedRequest
): MutateServiceContext & { actorId: string } => {
  const ctx = getServiceContext(req);
  if (!ctx.actorId) {
    req.requestLogger.error(
      { context: ctx },
      'Missing required actor id from request'
    );
    throw createHttpError(400, 'Missing required actor id from request');
  }

  return ctx as MutateServiceContext & { actorId: string };
};

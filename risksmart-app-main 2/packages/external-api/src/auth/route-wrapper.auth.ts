import createHttpError from 'http-errors';
import type { ParsedQs } from 'qs';

import type { AuthenticatedRequest, HandlerWithAuth } from '../types/request';
import { createMiddleware } from '../utils/createMiddleware';
import type { ResourceScopeKey } from './scopes';
import { expandScopes, hasAny, normalizeScopes } from './scopes.auth';

export interface AuthProps {
  requiredScopes: ResourceScopeKey[];
  extraCheck?: (req: AuthenticatedRequest) => boolean | Promise<boolean>; // optional owner/org guards
}

export function createAuthMiddleware<
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  Params extends Record<string, string> = {},
  ReqBody = unknown,
  ResBody = unknown,
  ReqQuery extends ParsedQs = ParsedQs,
>(
  { requiredScopes, extraCheck }: AuthProps,
  handler: HandlerWithAuth<Params, ReqBody, ResBody, ReqQuery>
) {
  return createMiddleware<Params, ReqBody, ResBody, ReqQuery>(
    async (req, res, next) => {
      // fail if no auth jwt decode obj
      if (!req.auth) {
        return next(createHttpError(401, 'Unauthenticated'));
      }

      //hasura mapped claims if a user token.
      const hasuraClaims = req.auth['https://hasura.io/jwt/claims'];
      const userOrgId = hasuraClaims?.['x-hasura-org-id'];
      const userTenantId = hasuraClaims?.['x-hasura-tenant-name'];

      const orgId = req.auth.org_id ?? userOrgId;
      const tenantId = req.auth.tenant_id ?? userTenantId;
      const granted = req.auth.permissions
        ? normalizeScopes(req.auth.permissions, ',')
        : [];
      const expanded = expandScopes(granted);

      // check for auth_id & tenant_id
      if (!orgId || !tenantId) {
        return next(createHttpError(401, 'Missing org_id | tenant_id claim'));
      }
      // run extra auth check if defined.
      const isOk = extraCheck
        ? await extraCheck(req as AuthenticatedRequest)
        : true;
      if (isOk !== true) {
        return next(
          createHttpError(
            403,
            'Forbidden, insufficient permissions for this resource'
          )
        );
      }
      // regular scope check.
      if (!hasAny(expanded, requiredScopes)) {
        return next(
          createHttpError(403, 'Insufficient scope for this resource')
        );
      }

      return handler(req, res, next);
    }
  );
}
